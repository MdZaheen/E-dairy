const mongoose = require("mongoose");
require("dotenv").config();
const Department = require("./src/models/Department");
const connectDB = require("./src/config/db");

const departments = [
    { departmentName: "Computer Science and Engineering" },
    { departmentName: "Information Technology" },
    { departmentName: "Electronics and Communication Engineering" },
    { departmentName: "Electrical and Electronics Engineering" },
    { departmentName: "Mechanical Engineering" },
    { departmentName: "Civil Engineering" },
    { departmentName: "Artificial Intelligence and Data Science" }
];

const seedDepartments = async () => {
    try {
        await connectDB();

        console.log("Checking existing departments...");
        const count = await Department.countDocuments();

        if (count > 0) {
            console.log(`Found ${count} departments. Clearing...`);
            await Department.deleteMany();
        }

        console.log("Seeding departments...");
        await Department.insertMany(departments);

        console.log("Departments seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding departments:", error);
        process.exit(1);
    }
};

seedDepartments();
