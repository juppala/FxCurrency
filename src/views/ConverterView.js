/*
//
//  ConverterView.js
//  Forex Exchange Calculator
//
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableWithoutFeedback,
  Image,
  StatusBar,
  ScrollView,
  Keyboard
} from 'react-native';

//CurrencyPickerView to show the picker for both from and to currency code selection.
import CurrencyPickerView from './CurrencyPickerView';
//Sample data
import rates from '../../data/rates.json';
//import background image
import bg from '../../data/bg.jpg';

const ROOT_URL = 'https://www.mycurrency.net/service/rates';

module.exports = React.createClass({
  ratesList : [],

  //stubData to load data from rates.json for debug. Change to false to load data from ROOT_URL
  stubData: true,
  getInitialState() {
    return ({
      from:{},
      to:{},
      fromCurrencyValue: '1',
      fromValue: '1',
      selectedOption: ''
    })
  },

  componentDidMount() {
    // Set stubData (//TODO @LINE:32=> stubData: false) to false to load currency rates from https://www.mycurrency.net/service/rates service.
    if(this.stubData) {
      this.loadCurrencyRates(rates);
    } else {
      this.getCurrencyRatesApiAsync();
    }
  },

  //Async service to load currency rates from services by mycurrency.
  async getCurrencyRatesApiAsync() {
    let url = ROOT_URL;
    return fetch(url)
      .then(response => response.json())
      .then(responseJSON => this.loadCurrencyRates(responseJSON))
      .catch((error) => {
        //in case of exception in the service fallback to stubData
        this.loadCurrencyRates(rates);
      });
  },

  loadCurrencyRates(rates) {
    this.ratesList = rates.map((item) => item.currency_code);

    //Default setting
    let from = rates[0] || {};
    let to = rates[1] ||  {};
    let toCurrencyValue = (to.rate || 1) / (from.rate || 1) + '';
    this.setState({
      rates,
      from,
      to,
      fromSelectedOption: from.currency_code,
      toCurrencyValue,
      toValue: Number.parseFloat(toCurrencyValue || 1).toFixed(2),
      toSelectedOption: to.currency_code
    });
  },

  //Set currency type
  setCurrencyType(isFrom, type) {
    let ratesCollection = this.state.rates;
    let currencyModel = ratesCollection.find(item => item.currency_code === type);
    if(currencyModel === undefined) {
      return;
    }
    let toCurrencyValue, toValue;
    if(isFrom) {
      toCurrencyValue = (this.state.to.rate / currencyModel.rate).toFixed(2);
      this.setState({
        from: currencyModel
      });
    } else {
      toCurrencyValue = (currencyModel.rate / this.state.from.rate).toFixed(2);
      this.setState({
        to: currencyModel
      });
    }
    toValue = (toCurrencyValue * (this.state.fromValue || 1)).toFixed(2);
    toValue = this.state.fromValue === "" ? "" : toValue;
    this.setState({
      toCurrencyValue,
      toValue
    });
  },

  //Convert Currency
  convertCurrency(from, value) {
    //trim the value, just to ignore the alert message for empty spaces.
    let fromValue = value.trim();
    let toValue;

    //Regex check for valid input format for currency.
    let isValidInput = /^[0-9]+(\.)?[0-9]*$/.test(fromValue);
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
        this.state.to.rate * input / this.state.from.rate:
        this.state.from.rate * input / this.state.to.rate;
        toValue = toValue.toFixed(2);
      break;
    }

    if(from === false) {
      [fromValue, toValue] = [toValue, fromValue];
    }
    this.setState({fromValue, toValue});
  },

  componentWillMount() {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide)
  },

  componentWillUnmount() {
      this.keyboardDidHideListener.remove()
  },
  //TODO scrollTo implementation for keyboard 
  keyboardDidHide(e) {
      //this.refs.scrollView.scrollTo({y: 50});
      //this.refs.scrollView.measure((ox, oy, width, height, px, py) => this.refs.scrollView.scrollTo({y: oy - 200}));
  },

  render() {
    return (
      //Container for From and To Currency type and values.
      <Image source={bg} style={styles.container}>
        <StatusBar
          barStyle="light-content"
        />
      <ScrollView
        ref='scrollView'
        >
        <Text style={[styles.flexRow, styles.textStyle, styles.headerStyle]}>
          Fx Currency Calculator
        </Text>
        <Text style={[styles.flexRow, styles.textStyle, styles.messageStyle]}>
          {this.state.from.name || ''} to {this.state.to.name || ''} {`\n`}
          1 {this.state.from.currency_code} = {this.state.toCurrencyValue} {this.state.to.currency_code}
        </Text>
        <View style={[styles.flexRow, {paddingTop:0}]}>
          <View style={styles.flexColumn}>
            <TouchableWithoutFeedback
              style={{flex:1,flexDirection:'row'}}
              onPress={() => this.refs.fromPicker.show()}
              >
              <View style={styles.boxViewStyle}>
                <Text style={[styles.textStyle, {fontSize: 15}]}>From:</Text>
                <Text
                  numberOfLines={1}
                  style={styles.textStyle}>{this.state.from.currency_code}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <CurrencyPickerView
              title={'From Currency'}
              ref={'fromPicker'}
              selectedValue={this.state.fromSelectedOption}
              options={this.ratesList}
              onSubmit={option => this.setCurrencyType(true, option)}
              />
          </View>
          <View style={styles.flexColumn}>
            <TextInput
              ref={'fromInput'}
              style={styles.textInputStyle}
              placeholder={this.state.fromCurrencyValue}
              placeholderTextColor='#999'
              keyboardType='numeric'
              onChangeText={value => this.convertCurrency(true, value)}
              value={this.state.fromValue}
              //onFocus={this.scrolldown.bind(this,'fromInput')}
              />
          </View>
        </View>

        <View style={styles.flexColumn}>
          <View style={styles.flexRow}>
            <View style={styles.flexColumn}>
              <TouchableWithoutFeedback
                style={{flex:1,flexDirection:'row'}}
                onPress={() => this.refs.toPicker.show()}
                >
                <View style={styles.boxViewStyle}>
                  <Text style={[styles.textStyle, {fontSize: 15}]}>To:    </Text>
                  <Text
                    numberOfLines={1}
                    style={styles.textStyle}>{this.state.to.currency_code}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              <CurrencyPickerView
                title={'To Currency'}
                ref={'toPicker'}
                selectedValue={this.state.toSelectedOption}
                options={this.ratesList}
                onSubmit={option => this.setCurrencyType(false, option)}
                />
            </View>
            <View style={styles.flexColumn}>
              <TextInput
                ref={'toInput'}
                style={styles.textInputStyle}
                placeholder={this.state.toCurrencyValue}
                placeholderTextColor='#999'
                keyboardType='numeric'
                onChangeText={value => this.convertCurrency(false, value)}
                value={this.state.toValue}
                //onFocus={this.scrolldown.bind(this,'toInput')}
                />
            </View>
          </View>

        </View>
        </ScrollView>
      </Image>
    )
  }
});

//Basic styles for ConverterView screen.
const styles = StyleSheet.create({
  container: {
    flex:1,
    //backgroundColor: '#049fd9'
    width: null,
    height: null,
    backgroundColor: 'rgba(0,0,0,0)',
    resizeMode: 'stretch'
  },
  headerStyle: {
    margin: 0,
    padding: 15,
    textAlign: 'center',
    backgroundColor: 'rgba(0.5, 0.5, 0.5, 0.5)'
  },
  flexColumn: {
    flex: 1
  },
  flexRow: {
    flexDirection: 'row',
    paddingTop: 20
  },
  messageStyle: {
    fontSize: 15,
    marginLeft: 10,
    marginTop: 0,
    paddingBottom: 0
  },
  boxViewStyle: {
    flex: 1, flexDirection:'row',
    borderWidth: 1, borderRadius: 8, borderColor: '#e8ebf1',
    alignItems: 'center',
    margin: 10,
    backgroundColor: 'rgba(0.5, 0.5, 0.5, 0.5)'
  },
  textStyle:{
    textAlign: 'left',
    fontSize: 25,
    margin: 5,
    color:'#ffffff'
  },
  textInputStyle: {
    height: 60,
    textAlign: 'right',
    borderWidth: 1, borderRadius: 8, borderColor: '#e8ebf1',
    margin: 10, padding: 10,
    color: '#ffffff',
    backgroundColor: 'rgba(0.5, 0.5, 0.5, 0.5)',
    fontSize:25
  }
})
