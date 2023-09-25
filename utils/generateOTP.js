
const generate = (digits = 5) => {
    if (digits < 1 || digits > 10) {
        throw new Error('Number of digits must be between 1 and 10');
    }

    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp.toString();
}


module.exports = generate;