const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")


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

StudentInCounselorSchema.plugin(mongoosePaginate)


module.exports = mongoose.model('StudentInCounselor', StudentInCounselorSchema);