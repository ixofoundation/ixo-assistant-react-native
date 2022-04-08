import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
// Added ts ignore for strange import issue
// @ts-ignore
import { useBot } from 'ixo-assistant-react-native';

export default function App() {
  const test = useBot({
    sockUrl: 'http://rasa.ixo.earth/api/ws',
    sockOpts: { transports: ['websocket'] },
    initMsg: 'test',
    onError: (e: any) => {
      console.error('assistant error', e);
    },
    // onUtter: (msg) => msg.action && handleCustomAssistantResponse(msg, botUtter),
  });
  console.log(test.msgHistory);

  return (
    <View style={styles.container}>
      <Text>Time: </Text>
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
