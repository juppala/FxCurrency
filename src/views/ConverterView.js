import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';

import CurrencyPickerView from './CurrencyPickerView';
import rates from '../../data/rates.json';

module.exports = React.createClass({

  ratesList : [],

  getInitialState() {
    this.ratesList = rates.map((item) => item.currency_code);

    //TODO need to implement default from and to in pickers
    let fromDefaultOption = '', toDefaultOption = '';
    if(this.ratesList && this.ratesList.length >= 2) {
      fromDefaultOption = this.ratesList[0];
      toDefaultOption = this.ratesList[1];
    }
    let from = rates && rates[0] ? rates[0] : {};
    let to = rates && rates[1] ? rates[1] :  {};
    let toCurrencyValue = (to.rate || 1) / (from.rate || 1) + '';
    return ({
      from,
      to,
      fromCurrencyValue: '1',
      fromValue: '1',
      fromSelectedOption: from.currency_code || 'USD',//fromDefaultOption,
      toCurrencyValue,
      toValue: toCurrencyValue,
      toSelectedOption: to.currency_code,//toDefaultOption,
      selectedOption: ''
    })
  },

  //Set currency type
  setCurrencyType(isFrom, type) {
    let ratesCollection = rates;
    let currencyModel = ratesCollection.find(item => item.currency_code === type);
    if(currencyModel === undefined)
    return;
    if(isFrom) {
      this.setState({from: currencyModel});
      let toValue = (this.state.to.rate / currencyModel.rate).toFixed(2);
      let toCurrencyValue = toValue;
      this.setState({ toCurrencyValue, toValue });
    } else {
      this.setState({to: currencyModel});
      let toValue = (currencyModel.rate / this.state.from.rate).toFixed(2);
      let toCurrencyValue = toValue;
      this.setState({ toCurrencyValue, toValue });
    }
  },

  //Convert Currency
  convertCurrency(from, value) {
    //trim the value, just to ignore the alert message for empty spaces.
    let fromValue = value.trim();
    let toValue;

    //Regex check for valid input format for currency.
    let isValidInput = /^-?(\d+\.?\d*)$|(\d*\.?\d+)$/.test(fromValue);// /(?:\d*\.)?\d+/
    if(!isValidInput && fromValue.length !== 0) {
      Alert.alert(
        'Invalid Currency input!',
        `${value} is not a valid currency input. Please enter valid input in decimal format`
      );
      //Reset the value and that loads default view.
      fromValue = '';
    }
    //Incase value in empty, set the state to default for the given from and to currency types.
    switch (fromValue) {
      case '':
      fromValue = '';
      toValue = '';
      break;
      default:
      let input = Number.parseFloat(fromValue);
      toValue = from ?
      this.state.to.rate*input/this.state.from.rate:
      this.state.from.rate*input/this.state.to.rate;
      toValue = toValue.toFixed(2);
      break;
    }

    if(from === false) {
      [fromValue, toValue] = [toValue, fromValue];
    }
    this.setState({fromValue, toValue});
  },

  render() {
    return (
      //Container for From and To Currency type and values.
      <View style={styles.container}>
        <View style={styles.flexRow}>
          <View style={styles.container}>
            <TouchableWithoutFeedback
              style={{flex:1,flexDirection:'row'}}
              onPress={() => this.refs.fromPicker.show()}
              >
              <View style={styles.boxViewStyle}>
                <Text numberOfLines={1} style={styles.textStyle}>{this.state.from.currency_code}</Text></View>
              </TouchableWithoutFeedback>
              <CurrencyPickerView
                ref={'fromPicker'}
                selectedValue={this.state.fromSelectedOption}
                options={this.ratesList}
                onSubmit={(option) => {
                  this.setState({
                    fromSelectedOption: option
                  });
                  this.setCurrencyType(true, option);
                }}
                />
            </View>
            <View style={styles.container}>
              <TextInput
                style={styles.textInputStyle}
                placeholder={this.state.fromCurrencyValue}
                placeholderTextColor='#555'
                keyboardType='numeric'
                onChangeText={value => this.convertCurrency(true, value)}
                value={this.state.fromValue}
                />
            </View>
          </View>


          <View style={styles.container}>
            <View style={styles.flexRow}>
              <View style={styles.container}>
                <TouchableWithoutFeedback
                  style={{flex:1,flexDirection:'row'}}
                  onPress={() => this.refs.toPicker.show()}
                  >
                  <View style={styles.boxViewStyle}>
                    <Text numberOfLines={1} style={styles.textStyle}>{this.state.to.currency_code}</Text>
                  </View>
                </TouchableWithoutFeedback>
                <CurrencyPickerView
                  ref={'toPicker'}
                  selectedValue={this.state.toSelectedOption}
                  options={this.ratesList}
                  onSubmit={(option) => {
                    this.setState({
                      fromSelectedOption: option
                    });
                    this.setCurrencyType(false, option);
                  }}
                  />
              </View>
              <View style={styles.container}>
                <TextInput
                  style={styles.textInputStyle}
                  placeholder={this.state.toCurrencyValue}
                  placeholderTextColor='#555'
                  keyboardType='numeric'
                  onChangeText={value => this.convertCurrency(false, value)}
                  value={this.state.toValue}
                  />
              </View>
            </View>
          </View>
        </View>
      )
    }
  });

  //Basic styles for ConverterView screen.
  const styles = StyleSheet.create({
    container: {
      flex:1,
      backgroundColor: '#049fd9'
    },
    flexColumn: {
      flex:1
    },
    flexRow:{
      flexDirection: 'row',
      paddingTop: 20
    },
    boxViewStyle: {
      flex:1, flexDirection:'row',
      borderWidth:1, borderRadius: 8, borderColor: '#e8ebf1',
      alignItems: 'center',
      margin: 10
    },
    textStyle:{
      textAlign:'left',
      fontSize:25,
      padding:5,
      color:'#ffffff'
    },
    textInputStyle: {
      height: 50,
      textAlign: 'right',
      borderWidth:1, borderRadius:8, borderColor: '#e8ebf1',
      margin:10, padding: 10,
      color:'#ffffff'
    }
  })
