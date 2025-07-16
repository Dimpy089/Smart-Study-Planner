const subject = require('../models/Subject');
const dailyPlan = require('../models/DailyPlan');

exports.generatePlan = async (req, res) => {
    const userId = req.user.id;
    const { dailyHours } = req.body;
    const minutes = dailyHours * 60;

    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    try {
        const subjects = await subject.find({ userId });
        console.log("Subjects fetched:", subjects);

        if (!subjects.length) {
            return res.status(400).json({ message: "No subjects found for user" });
        }

        const tasksList = [];

        subjects.forEach((sub) => {
            console.log("Processing subject:", sub.subject);

            const weight = sub.priority === 'High' ? 3 : sub.priority === 'Medium' ? 2 : 1;

            // Normalize titles array
            let titles = [];
            if (Array.isArray(sub.title)) {
                titles = sub.title[0].split(',').map(t => t.trim()); // ✅ fixed
            } else if (typeof sub.title === 'string') {
                titles = sub.title.split(',').map(t => t.trim());
            }


            // Parse and validate examDate
            const examDateObj = sub.examDate ? new Date(sub.examDate) : null;
            if (!examDateObj || isNaN(examDateObj)) {
                console.warn(`Invalid or missing examDate for subject ${sub.subject}, skipping tasks`);
                return;
            }

            titles.forEach((title) => {
                tasksList.push({
                    subject: sub.subject,
                    title,
                    duration: weight * 30,
                    date: startOfDay(examDateObj),
                    priority: sub.priority,
                    difficulty: sub.difficulty,
                    status:'pending'
                });
            });
        });

        console.log("Tasks list length:", tasksList.length);

        if (tasksList.length === 0) {
            return res.status(400).json({ message: "No valid tasks found to schedule" });
        }

        // Sort tasks by date, priority, and difficulty
        tasksList.sort((a, b) => {
            const priorityValues = { 'High': 1, 'Medium': 2, 'Low': 3 };
            const difficultyValues = { 'Easy': 3, 'Medium': 2, 'Hard': 1 };

            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            if (priorityValues[a.priority] !== priorityValues[b.priority])
                return priorityValues[a.priority] - priorityValues[b.priority];
            return difficultyValues[a.difficulty] - difficultyValues[b.difficulty];
        });

        const startDate = startOfDay(new Date());
        const endDate = startOfDay(new Date(Math.max(...tasksList.map(task => task.date))));

        let curr = new Date(startDate);
        const dailyPlans = [];
        console.log("Daily available minutes:", minutes);
console.log("Tasks before scheduling:", tasksList.length);
        while (curr <= endDate && tasksList.length > 0) {
            const dateStr = curr.toISOString().slice(0, 10);
            console.log(`Generating plan for date: ${dateStr}`);

            let available = minutes;
            const todayTask = [];

            // Assign tasks that fit into the available time
            while (available > 0 && tasksList.length > 0) {
                const next = tasksList[0];
                console.log(`Next task duration: ${next.duration}, available: ${available}`);
                if (next.duration <= available) {
                    todayTask.push({
                        subject: next.subject,
                        title: next.title,
                        duration: next.duration
                    });
                    available -= next.duration;
                    tasksList.shift();
                } else {
                    console.log("Not enough time for task, breaking inner loop.");
                    break;
                }
            }

            // Only save if tasks exist for the day
            if (todayTask.length > 0) {
                dailyPlans.push({
                    userId,
                    date: dateStr,
                    tasks: todayTask
                });
            }else {
        console.log("No tasks fit for this day.");
    }

            curr.setDate(curr.getDate() + 1);
        }

        console.log("Daily plans count:", dailyPlans.length);

        await dailyPlan.deleteMany({ userId });
        if (dailyPlans.length > 0) {
            await dailyPlan.insertMany(dailyPlans);
        }

        res.status(201).json({ message: 'Plan generated successfully', totalDays: dailyPlans.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateTaskStatus = async (req, res) => {
    const { date, title, status } = req.body;
    const userId = req.user.id;

    try {
        const plan = await dailyPlan.findOne({ userId, date });
        if (!plan) {
            return res.status(404).json({ error: "Plan not found for the given date" });
        }

        const task = plan.tasks.find(t => t.title === title);
        if (!task) {
            return res.status(404).json({ error: "Task not found in the plan" });
        }

        task.status = status;
        await plan.save();

        if (status === 'missed') {
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const nextDateStr = nextDate.toISOString().split('T')[0];

            let nextPlan = await dailyPlan.findOne({ userId, date: nextDateStr });
            if (!nextPlan) {
                nextPlan = new dailyPlan({ userId, date: nextDateStr, tasks: [] });
            }

            nextPlan.tasks.push({ ...task.toObject(), status: 'pending' }); // clone to avoid Mongo nested ref issues
            await nextPlan.save();
        }

        res.send("Updated");
    } catch (err) {
        console.error("Error updating task status:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.getAllPlans = async (req, res) => {
    const userId = req.user.id;
    const plans = await dailyPlan.find({ userId }).sort({ date: 1 });
    res.json(plans);
};

exports.getPlanByDate = async (req, res) => {
    const userId = req.user.id;
    const date = req.params.date;

    try {
        const plan = await dailyPlan.findOne({ userId, date });
        if (!plan) {
            return res.json({ tasks: [] });  // no tasks for that day
        }
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
