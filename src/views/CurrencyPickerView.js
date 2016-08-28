import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Picker,
  Dimensions
} from 'react-native';

const SCREEN = {
  WIDTH: Dimensions.get('window').width,
  HEIGHT: Dimensions.get('window').height
};

module.exports = React.createClass({
  getInitialState() {
    return {
      isPickerShown: false,
      selectedOption: this.props.selectedValue || this.props.options[0]
    };
  },

  show() {
    this.setState({
      isPickerShown: true,
    });
  },

  donePicker() {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.selectedOption);
    }
    this.setState({
      isPickerShown: false,
    });
  },

  dismissPicker() {
    this.setState({
      isPickerShown: false,
      selectedOption: this.props.selectedValue || this.props.options[0]
    });
  },

  onPickerValueChange(option) {
    this.setState({
      selectedOption: option,
    });
  },

  renderPickerItem(option, index) {
    const label = (this.props.labels) ? this.props.labels[index] : option;
    return (
      <Picker.Item
        key={option}
        value={option}
        label={label}
      />
    );
  },

  render() {

    return (
      <Modal
        style={{backgroundColor:'red'}}
        animationType="slide"
        transparent={true}
        visible={this.state.isPickerShown}
      >
        <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <TouchableOpacity onPress={this.dismissPicker}>
                <Text style={styles.pickerBtnStyle}>
                  Close
                </Text>
              </TouchableOpacity>

                <Text style={[styles.pickerBtnStyle, {color: 'black'}]}>
                  {this.props.title || ''}
                </Text>

              <TouchableOpacity onPress={this.donePicker}>
                <Text style={styles.pickerBtnStyle}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mainBox}>
              <Picker
                ref={'picker'}
                style={{width: SCREEN.WIDTH}}
                selectedValue={this.state.selectedOption}
                onValueChange={(option) => {
                  this.onPickerValueChange(option);
                }}
              >
                {this.props.options.map((option, index) => this.renderPickerItem(option, index))}
              </Picker>
            </View>

          </View>
        </View>
      </Modal>
    );
  }
});

const styles = StyleSheet.create({
  basicContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalContainer: {
    width: SCREEN.WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN.WIDTH,
    padding: 8,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#64bbe3',
    justifyContent: 'space-between'
  },
  pickerBtnStyle: {
    fontSize: 20,
    color: '#049fd9'
  }
});
