const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")

const ReportSchema = new mongoose.Schema({
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flag: String,
}, {
  timestamps: true
});

ReportSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Report", ReportSchema);
