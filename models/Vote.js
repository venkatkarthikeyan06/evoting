const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Vote = sequelize.define('Vote', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        candidate: {
            type: DataTypes.STRING,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    return Vote;
}; 