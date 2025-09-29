require("dotenv").config();

const PORT = process.env.PORT || 5000;

const superAdmin = {
    email: process.env.SUPER_ADMIN_EMAIL || "",
    password: process.env.SUPER_ADMIN_PASSWORD || ""
}

module.exports = { PORT, superAdmin };