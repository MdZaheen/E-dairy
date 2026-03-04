const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        departmentName: {
            type: String,
            required: [true, "Department name is required"],
            unique: true,
            trim: true,
        },

        hodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // Department can exist before HOD is assigned
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Department", departmentSchema);
