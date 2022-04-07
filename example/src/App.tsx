import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { multiply } from 'ixo-assistant-react-native';

export default function App() {

  const [result, setResult] = React.useState<number | undefined>();
  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  // const test = useBot({
  //   sockUrl: '',
  //   sockOpts: { transports: ['websocket'] },
  //   initMsg: 'test',
  //   onError: (e: any) => {
  //     console.error('assistant error', e);
  //   },
  //   // onUtter: (msg) => msg.action && handleCustomAssistantResponse(msg, botUtter),
  // });
  

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
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
