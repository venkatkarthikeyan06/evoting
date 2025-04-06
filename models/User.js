const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        voterId: {
            type: DataTypes.STRING,
            unique: true
        },
        aadharNumber: {
            type: DataTypes.STRING,
            unique: true
        },
        phoneNumber: DataTypes.STRING,
        address: DataTypes.TEXT,
        loginAttempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lockUntil: DataTypes.DATE,
        lastLogin: DataTypes.DATE,
        hasVoted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    return User;
}; 