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
  Keyboard,
  ActivityIndicator
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
  stubData: false,
  getInitialState() {
    return ({
      from:{},
      to:{},
      fromCurrencyValue: '1',
      fromValue: '1',
      selectedOption: '',
      isLoading: true
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
      toSelectedOption: to.currency_code,
      isLoading: false
    });
  },

  //Set currency type
  setCurrencyType(isFrom, type) {
    let ratesCollection = this.state.rates;
    let currencyModel = ratesCollection.find(item => item.currency_code === type);
    if(currencyModel === undefined) {
      return;
    }
    let fromValue, toCurrencyValue, toValue;
    if(isFrom) {
      toCurrencyValue = (this.state.to.rate / currencyModel.rate);
      fromValue = ((this.state.toValue || toCurrencyValue) / toCurrencyValue).toFixed(2);
      toCurrencyValue = toCurrencyValue.toFixed(4);
      fromValue = this.state.toValue === '' ? '' : fromValue;
      toValue =this.state.toValue;
      this.setState({
        from: currencyModel
      });
    } else {
      fromValue = this.state.fromValue;
      toCurrencyValue = (currencyModel.rate / this.state.from.rate).toFixed(2);
      toValue = ((currencyModel.rate / this.state.from.rate) * (this.state.fromValue || 1)).toFixed(2);
      toValue = this.state.fromValue === "" ? "" : toValue;
      this.setState({
        to: currencyModel
      });
    }
    this.setState({
      fromValue,
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
        `${value} is not a valid currency input. Please enter valid amount.`,
        [{
          text: 'OK', onPress: () => {
              console.log('OK Pressed!');
              //Reset the value and that loads default view.
              fromValue = '';
              this.currencyConvertCallBack(from, fromValue, toValue);
            }
        }]
      );

    } else {
      this.currencyConvertCallBack(from, fromValue, toValue);
    }
  },

  currencyConvertCallBack(from, fromValue, toValue) {
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

  renderCurrencySelector(label, currency_code) {
    if (!this.state.isLoading) {
      let isFrom = (label === 'From');
      let code = (isFrom ? this.state.from.code : this.state.to.code);
      code = code.toLowerCase();
      return (
        <View style={styles.flexColumn}>
          <TouchableWithoutFeedback
            style={{flex:1,flexDirection:'row'}}
            onPress={() => {
              if(isFrom) {
                this.refs.FromPicker.show();
              } else {
                this.refs.ToPicker.show();
              }
            }}
            >
            <View style={[styles.boxViewStyle, {flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'}]}>
              <Text style={[styles.textStyle, {fontSize: 15}]}>{`${label}:${isFrom? '': '   '}`}</Text>
              <Image style={{width: 30, height: 25, borderWidth:1, borderColor:'white'}}
                source={{uri: `https://caches.space/flags/${code}.png`}}
              />
              <Text
                numberOfLines={1}
                style={[styles.textStyle]}>{currency_code}

              </Text>


            </View>
          </TouchableWithoutFeedback>
          <CurrencyPickerView
            title={`${label} Currency`}
            ref={(`${label}Picker`)}
            selectedValue={(isFrom ? this.state.fromSelectedOption : this.state.toSelectedOption)}
            options={this.ratesList}
            onSubmit={option => this.setCurrencyType(isFrom, option)}
            />
        </View>
      )
    }
  },
  renderCurrentInputSelector(isFrom) {
    if(!this.state.isLoading) {
      return (
        <View style={styles.flexColumn}>
          <TextInput
            ref={isFrom ? 'fromInput' : 'toInput'}
            style={styles.textInputStyle}
            placeholder={isFrom ? this.state.fromCurrencyValue : this.state.toCurrencyValue}
            placeholderTextColor='#999'
            keyboardType='numeric'
            onChangeText={value => this.convertCurrency(isFrom, value)}
            value={isFrom ? this.state.fromValue : this.state.toValue}
            //onFocus={this.scrolldown.bind(this,'fromInput')}
            />
        </View>
      )
    }
  },
  renderLoading() {
    if(this.state.isLoading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator
            animating={this.state.isLoading}
            size="large"
          />
        </View>
      )
    }
  },
  renderConversionTitle() {
    if(!this.state.isLoading) {
      return (
        <Text style={[styles.flexRow, styles.textStyle, styles.messageStyle]}>
          {this.state.from.name || ''} to {this.state.to.name || ''} {`\n`}
          1 {this.state.from.currency_code} = {this.state.toCurrencyValue} {this.state.to.currency_code}
        </Text>
      )
    }
  },
  render() {
    return (
      //Container for From and To Currency type and values.
      <Image source={bg} style={styles.container}>
        <StatusBar barStyle="light-content" />
        {this.renderLoading()}
        <ScrollView ref='scrollView'>

        <Text style={[styles.flexRow, styles.textStyle, styles.headerStyle]}>
          Fx Currency Calculator
        </Text>

        {this.renderConversionTitle()}

        {/*From*/}
        <View style={[styles.flexRow, {paddingTop:0}]}>
          {this.renderCurrencySelector('From', this.state.from.currency_code)}
          {this.renderCurrentInputSelector(true)}
        </View>

        {/*To*/}
        <View style={styles.flexColumn}>
          <View style={styles.flexRow}>
            {this.renderCurrencySelector('To', this.state.to.currency_code)}
            {this.renderCurrentInputSelector(false)}
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
    flex: 1,
    //backgroundColor: '#049fd9'
    width: null,
    height: null,
    backgroundColor: 'rgba(0,0,0,0)',
    resizeMode: 'stretch'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: 'rgba(0.5, 0.5, 0.5, 0.5)'
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
