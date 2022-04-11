import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
// Added ts ignore for strange import issue
// @ts-ignore
import { useBot } from 'ixo-assistant-react-native';

export default function App() {
  /*

  const {
    msgHistory,
    onInputRef,
    userText,
    setUserText,
    sendUserText,
    selectOption,
    botUtter,
    restartSession,
  } */

  const { msgHistory, setUserText, sendUserText } = useBot({
    sockUrl: 'http://rasa.ixo.earth',
    sockOpts: { transports: ['websocket'] },
    initMsg: 'test',
    onError: (e: any) => {
      console.error('assistant error', e);
    },
    onUtter: (msg) => console.log(msg),
  });

  return (
    <View style={styles.container}>
      {msgHistory.map((msg, index) => {
        return <Text key={index}>Text: {msg.text}</Text>;
      })}
      <Text
        onPress={() => {
          sendUserText('bobby');
        }}
      >
        Time:
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
