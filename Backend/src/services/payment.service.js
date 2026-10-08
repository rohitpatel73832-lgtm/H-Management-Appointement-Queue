import Razorpay from "razorpay";

// console.log(
//     "Razorpay Key ID:",
//     process.env.RAZORPAY_KEY_ID
// );

// console.log(
//     "Razorpay Secret exists:",
//     !!process.env.RAZORPAY_KEY_SECRET
// );

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default razorpay;