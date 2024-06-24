import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment-timezone';
import Modal from 'react-native-modal';
import HapticFeedback from 'react-native-haptic-feedback';
import BestIcon from 'react-native-vector-icons/Ionicons';

const { height, width } = Dimensions.get('window');

const generateTimeSlots = () => {
  const times = [];
  const start = moment().startOf('day');
  for (let i = 0; i < 96; i++) {
    times.push(start.clone().add(i * 15, 'minutes').format('h:mm a'));
  }
  return times;
};

const timeSlots = generateTimeSlots();

const TimePickerHorizontal = ({ selectedTime, onTimeChange, type }) => {
  const scrollViewRef = React.useRef(null);

  useEffect(() => {
    const index = timeSlots.findIndex(time => time === selectedTime);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * 80 - (width - 430) / 2, animated: true });
    }
  }, [selectedTime]);

  const onScroll = (event) => {
    const index = Math.round((event.nativeEvent.contentOffset.x + (width - 430) / 2) / 80);
    onTimeChange(timeSlots[index], type);
  };

  return (
    <ScrollView
      horizontal
      ref={scrollViewRef}
      showsHorizontalScrollIndicator={false}
      snapToInterval={80}
      decelerationRate="fast"
      onMomentumScrollEnd={onScroll}
      contentContainerStyle={{
        paddingHorizontal: (width - 80) / 2,
        alignItems: 'center',
      }}
    >
      {timeSlots.map((time, index) => (
        <View key={index} style={styles.timeSlot}>
          <Text style={selectedTime === time ? styles.selectedTime : styles.timeText}>
            {time.split(' ')[0]}
          </Text>
          <Text style={selectedTime === time ? styles.selectedAmPm : styles.amPmText}>
            {time.split(' ')[1]}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const App = () => {
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
  const [timezone, setTimezone] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState('6:00 am');
  const [endTime, setEndTime] = useState('8:00 am');
  const [savedTimes, setSavedTimes] = useState({});
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const tz = moment.tz.guess();
    setTimezone(tz);
  }, []);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    if (savedTimes[day.dateString]) {
      setStartTime(savedTimes[day.dateString].start);
      setEndTime(savedTimes[day.dateString].end);
    } else {
      setStartTime('6:00 am');
      setEndTime('8:00 am');
    }
    setIsError(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const saveTimes = () => {
    setSavedTimes({
      ...savedTimes,
      [selectedDate]: { start: startTime, end: endTime }
    });
    setModalVisible(false);
  };

  const onTimeChange = (selectedTime, type) => {
    HapticFeedback.trigger('impactLight');
    if (type === 'start') {
      setStartTime(selectedTime);
    } else {
      setEndTime(selectedTime);
    }
    validateTimes(selectedTime, type);
  };

  const validateTimes = (newTime, type) => {
    const startMoment = moment(startTime, 'h:mm a');
    const endMoment = moment(endTime, 'h:mm a');
    const newMoment = moment(newTime, 'h:mm a');
    if (type === 'start') {
      setIsError(newMoment.isSameOrAfter(endMoment));
    } else {
      setIsError(newMoment.isSameOrBefore(startMoment));
    }
  };

  const markedDates = Object.keys(savedTimes).reduce((acc, date) => {
    acc[date] = { selected: true, selectedColor: '#00D06D', selectedTextColor: 'black' };
    return acc;
  }, {});

  markedDates[currentDate] = {
    selected: true,
    selectedColor: savedTimes[currentDate] ? '#00D06D' : '#FF5D62',
    selectedTextColor: savedTimes[currentDate] ? 'black' : 'white',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.calendarTitle}>Availability</Text>
      <View style={styles.calendarWrapper}>
        <Calendar
          current={currentDate}
          onDayPress={onDayPress}
          markedDates={markedDates}
          theme={{
            calendarBackground: 'black',
            textSectionTitleColor: '#d9e1e8',
            selectedDayBackgroundColor: '#00D06D',
            selectedDayTextColor: 'black',
            todayTextColor: '#FF5D62',
            dayTextColor: '#d9e1e8',
            monthTextColor: 'white',
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16,
            textDayFontSize: 16,
            'stylesheet.calendar.header': {
              week: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: '#d9e1e8',
                borderTopWidth: 1,
                borderTopColor: '#d9e1e8',
                paddingBottom: 5,
                paddingTop: 5,
              },
              dayHeader: {
                color: '#d9e1e8',
                fontWeight: 'bold',
                width: 32,
                textAlign: 'center',
              },
              monthText: {
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                margin: 10,
              },
            },
          }}
          hideArrows
          hideExtraDays
          disableMonthChange
          firstDay={0}
        />
      </View>
      <View style={styles.timezoneContainer}>
        <Text style={styles.timezoneText}>{timezone}</Text>
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        swipeDirection="down"
        onSwipeComplete={closeModal}
        style={styles.modal}
        backdropOpacity={0.7}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set availability on {moment(selectedDate).format('MMM DD, YYYY')}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerLine} />
          <Text style={styles.timePickerLabel}>Start work at</Text>
          <TimePickerHorizontal
            selectedTime={startTime}
            onTimeChange={onTimeChange}
            type="start"
          />
          <Text style={styles.timePickerLabel}>End work by</Text>
          <TimePickerHorizontal
            selectedTime={endTime}
            onTimeChange={onTimeChange}
            type="end"
          />
          <View style={styles.headerLine} />
          {isError && (
            <View style={styles.errorContainer}>
              {/* <BestIcon name="warning" size={16} color="#FF5D62" /> */}
              <Text style={styles.errorText}>Select an end time that's later than your start time.</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.setTimeButton, isError && { backgroundColor: 'gray' }]}
            onPress={saveTimes}
            disabled={isError}
          >
            <Text style={styles.setTimeButtonText}>Set time</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  calendarTitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  calendarWrapper: {
    borderBottomColor: '#d9e1e8',
  },
  headerContainer: {
    alignItems: 'center',
  },
  headerLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#d9e1e8',
    marginVertical: 5,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 5,
  },
  dayHeader: {
    color: '#d9e1e8',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  monthText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  timezoneContainer: {
    marginTop: 15,
    backgroundColor: '#333',
    padding: 10,
    alignItems: 'center',
  },
  timezoneText: {
    color: 'white',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'black',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: 'gray',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  timePickerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 5,
  },
  timePicker: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timePickerLabel: {
    color: '#d9e1e8',
    fontSize: 16,
    marginTop: 10
  },
  timePickerHorizontal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlot: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#d9e1e8',
    fontSize: 24,
  },
  amPmText: {
    color: '#d9e1e8',
    fontSize: 16,
    marginTop: -8,
  },
  selectedTime: {
    color: '#00D068',
    fontFamily: 'Lazzer-Bold',
    fontSize: 30, 
  },
  selectedAmPm: {
    color: '#00D068',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -8,
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: '#FF5D62',
    textAlign: 'center',
    marginLeft: 5,
  },
  setTimeButton: {
    backgroundColor: '#00D068',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
    alignSelf: 'center',
  },
  setTimeButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
