const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const StudentInCounselorSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    {
        timestamps: true
    });


module.exports = mongoose.model('StudentInCounselor', StudentInCounselorSchema);