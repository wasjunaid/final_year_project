require("dotenv").config();

const PORT = process.env.PORT || 6000;

const superAdmin = {
    email: process.env.SUPER_ADMIN_EMAIL || "",
    password: process.env.SUPER_ADMIN_PASSWORD || ""
}

module.exports = { PORT, superAdmin };