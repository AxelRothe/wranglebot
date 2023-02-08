class FilterExpression {
  key;
  expression;

  constructor(key, expression) {
    this.key = key;
    this.expression = expression.toString();
  }
}

class MetaFilter {
  filters = [];

  constructor(filterExpressions) {
    filterExpressions.forEach((pair) => {
      this.filters.push(new FilterExpression(pair[0], pair[1]));
    });
  }

  filter(metaFiles) {
    return metaFiles.filter((file) => {
      let flag = true;
      this.filters.forEach((filter) => {
        if (!this.match(file, filter)) {
          flag = false;
        }
      });
      return flag;
    });
  }

  match(file, filter) {
    let val = "";
    const values = file.toJSON();

    const stringToRegex = (str) => {
      // Main regex
      const main = str.match(/\/(.+)\/.*/)[1];

      // Regex options
      const options = str.match(/\/.+\/(.*)/)[1];

      // Compiled regex
      return new RegExp(main, options);
    };

    if (values.hasOwnProperty(filter.key) && values[filter.key]) {
      val = values[filter.key];
    } else if (values.metaData[filter.key] && values.metaData[filter.key]) {
      val = values.metaData[filter.key];
    } else {
      return false;
    }

    try {
      const result = val.match(stringToRegex(filter.expression));
      return result !== null && result.length > 0;
    } catch (e) {
      const result = val.match();
      return result;
    }
  }
}
module.exports.MetaFilter = MetaFilter;
module.exports.FilterExpression = FilterExpression;
