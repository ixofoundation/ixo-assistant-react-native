import React from 'react';
import { View, Share, Text } from 'react-native';

const handlers: any = {
  credit: {
    showAddressText: async (wallet: any) => {
      const address = await getWalletAddress('agent', wallet);

      return [
        {
          component: ({ msg }: any) => (
            <Text>{msg + address}</Text>
            // <MessageBubble
            //   direction={msg.direction}
            //   onPress={() => {
            //     Clipboard.setString(address);
            //     Alert.alert('Address copied to clipboard!');
            //   }}
            // >
            //   <MessageText text={address} direction={msg.direction} />
            // </MessageBubble>
          ),
        },
      ];
    },

    showAddressQRCode: async (wallet: any) => {
      const address = await getWalletAddress('agent', wallet);

      return [
        { text: 'See below' },

        {
          component: ({ msg }: any) => (
            <View style={{ alignItems: 'center', margin: 20 }}>
              <Text>{address + msg.direction}</Text>
              {/* <QRCode value={address} size={200} /> */}
            </View>
          ),
        },
      ];
    },

    shareAddress: async (wallet: any) => {
      Share.share({ message: await getWalletAddress('agent', wallet) });
      return [{ text: 'Ok I have opened the sharing widget for you' }];
    },
  },
};

const getWalletAddress = (walletType: string, wallet: any): any => {
  wallet[walletType]
    .getAccounts()
    .then((as: { address: any }[]) => as[0].address);
};

export async function assistantResponseHandler(
  msg: any,
  botUtter: any,
  wallet: any
) {
  type ObjectKey = keyof typeof handlers;
  const [actionCategory, actionId]: string = msg.action.split('.');
  const handler = handlers[actionCategory as ObjectKey][actionId](wallet);

  if (!handler)
    return console.warn('Handler not found for returned action:', msg.action);

  const utterances = await handler();

  utterances.forEach(botUtter);
}

// module.exports = async (msg, botUtter, wallet) => {
//   const [actionCategory, actionId] = msg.action.split('.'),
//     handler = handlers[actionCategory][actionId];

//   if (!handler)
//     return console.warn('Handler not found for returned action:', msg.action);

//   const utterances = await handler();

//   utterances.forEach(botUtter);
// };
