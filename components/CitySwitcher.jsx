const React = require('react');

const CitySwitcher = React.createClass({
  getInitialState: function() {
    return {
      currentCity: "SF"
    };
  },

  selectCity: function(e) {
    this.props.switchCity();
    this.setState({ currentCity: e.currentTarget.innerText });
  },

  render: function() {
    const citySpans = ["SF", "NYC"].map((city, i) => {
      let selected = "";
      if (city === this.state.currentCity) {
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
