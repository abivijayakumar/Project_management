const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { getSequelize } = require('../config/database');

const sequelize = getSequelize();

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required' },
      len: { args: [2, 100], msg: 'Full name must be between 2 and 100 characters' }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      name: 'unique_user_email',
      msg: 'A user with this email address already exists'
    },
    validate: {
      isEmail: { msg: 'Please provide a valid email address' }
    },
    set(value) {
      this.setDataValue('email', value ? value.trim().toLowerCase() : value);
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Password must be at least 6 characters long' }
    }
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      const id = this.getDataValue('id');
      return id != null ? id.toString() : null;
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Safe JSON serialization (excludes password, includes _id for frontend compatibility)
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  values._id = values.id != null ? values.id.toString() : null;
  return values;
};

module.exports = User;
