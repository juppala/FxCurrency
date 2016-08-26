import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  UIExplorerBlock,
  Picker
} from 'react-native';

module.exports = React.createClass({
  getInitialState() {
    console.log(rates);
    return ({
      from:{
        "currency_code": "EUR",
        "rate": 0.8861,
        "code": "EU",
        "name": "European Union"
      },
      to:{
        "currency_code": "INR",
        "rate": 67.009,
        "code": "RS",
        "name": "India"
      },
      fromCurrencyType: 'USD',
      fromCurrencyValue: '1',
      fromValue: '1',
      toCurrencyType: 'EURO',
      toCurrencyValue: '0.89',
      toValue: '0.89',
      selected: 'key1',
      color: 'red'
    })
  },
  setCurrencyType(from, type) {
    console.log(this.state.from.test, this.state.to.test);
    let ratesCollection = rates;
    console.log(type, rates);
    let currencyModel = ratesCollection.filter(item => item.currency_code === type);
    if(currencyModel.length === 0)
      return;
    if(from) {
      let fromCurrencyType = currencyModel.currency_code;
      let fromCurrencyValue = currencyModel.rate;
      let toValue = this.state.toCurrencyValue / currencyModel.rate;
      let toCurrencyValue = toValue;
      this.setState({ fromCurrencyType, toCurrencyValue, toValue });
    } else {
      let toCurrencyType = currencyModel.currency_code;
      let fromCurrencyValue = this.state.fromCurrencyValue / currencyModel.rate;
      let toValue = currencyModel.rate;
      let toCurrencyValue = toValue;
      this.setState({ fromCurrencyType, toCurrencyValue, toValue });
    }
  },
  convertCurrency(from, value) {
    //trim the value, just to ignore the alert message for empty spaces.

    let fromValue = value.trim();
    let toValue;
    //Check for NaN to alert the user for invalid input.
    if(Number.isNaN(Number.parseFloat(fromValue)) && value !== '' && value !== '.') {
      Alert.alert(
            'Invalid Currency input!',
            `${value} is not a valid currency input. Please enter valid input in decimal format`
          );
          //Reset the value and that loads default view.
          value = '';
    }
    //Incase value in empty, set the state to default for the given from and to currency types.
    switch (value) {
      case '':
        fromValue = '';
        toValue = '';
        from = true;
        break;
      case '.':
        toValue = ' ';
        break;
      default:
        let input = Number.parseFloat(fromValue);
        toValue = from ?
          this.state.toCurrencyValue*input/this.state.fromCurrencyValue:
          this.state.fromCurrencyValue*input/this.state.toCurrencyValue;
          toValue = toValue.toFixed(2);
          break;
    }

    if(from === false) {
      [fromValue, toValue] = [toValue, fromValue];
    }
    this.setState({fromValue, toValue});
  },
  changeMode() {
    const newMode = this.state.mode === Picker.MODE_DIALOG
        ? Picker.MODE_DROPDOWN
        : Picker.MODE_DIALOG;
    this.setState({mode: newMode});
  },

  onValueChange(key: string, value: string) {
    const newState = {};
    newState[key] = value;
    this.setState(newState);
  },

  render() {
    return (
      //Container for From and To Currency type and values.
      <View style={styles.container}>
        <View style={styles.inputs}>

          {/*<Picker
            style={styles.picker}
            selectedValue={this.state.selected}
            onValueChange={this.onValueChange.bind(this, 'selected')}
            mode="dialog">
            <Picker.Item label="hello" value="key0" />
            <Picker.Item label="world" value="key1" />
          </Picker>*/}

          <TextInput
            style={styles.input}
            placeholder={this.state.fromCurrencyType}
            placeholderTextColor="#555"
            onChangeText={(type) => {
              this.setCurrencyType(true, type);
              //this.setState({fromCurrencyType: type});
              console.log(this.state.fromCurrencyType, type);
            }}
            />
          <TextInput
            style={styles.input}
            placeholder={this.state.fromCurrencyValue}
            placeholderTextColor='#555'
            keyboardType='numeric'
            onChangeText={(value) => {
              this.convertCurrency(true, value);
              console.log('from value: ', value);
            }}
            value={this.state.fromValue}
            />
        </View>
        <View style={styles.inputs}>
          <TextInput
            style={styles.input}
            placeholder={this.state.toCurrencyType}
            placeholderTextColor='#555'
            onChangeText={(type) => {
              this.setState({toCurrencyType: type});
              console.log(this.state.toCurrencyType, type);
            }}
            />
          <TextInput
            style={styles.input}
            placeholder={this.state.toCurrencyValue}
            placeholderTextColor='#555'
            keyboardType='numeric'
            onChangeText={(value) => {
              this.convertCurrency(false, value);
              console.log('to value: ', value);
            }}
            value={this.state.toValue}
            />
        </View>
      </View>
    )
  }
});

//Basic styles for ConverterView screen.
const styles = StyleSheet.create({
  container: {
    marginTop: 20
  },
  inputs: {
    flex: 1,
    flexDirection: 'row'
  },
  input: {
    flex: 1,
    flexDirection: 'column',
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'black',
    textAlign: 'center',
    margin: 10,
    padding: 10
  },
  picker: {
    width: 100,
  },
  redFont: {
    color: 'red'
  }
})
