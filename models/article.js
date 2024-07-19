'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Article.init({
    title:{
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '标题不能为空'
        },
        notNull: {
          msg: '标题不能为空'
        },
        len: {
          args: [1, 20],
          msg: '标题长度必须在1-20之间'
        }
      }
    },
    content: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};
