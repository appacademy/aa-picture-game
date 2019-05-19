const React = require('react');

const CitySwitcher = React.createClass({

  selectCity: function(e) {
    this.props.switchCity(e.currentTarget.innerText);
  },

  render: function() {
    const citySpans = ["SF", "NYC"].map((city, i) => {
      let selected = "";
      if (city === this.props.city) {
        selected = "selected";
      }
      return (
        <span
          key={i}
          className={selected}
          onClick={this.selectCity}>
          {city}
        </span>
      );
    });
    return (
      <div className="city-spans">{citySpans}</div>
    );
  }
});

module.exports = CitySwitcher;
