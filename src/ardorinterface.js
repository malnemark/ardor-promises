
import axios from 'axios';
import qs from 'qs';
import {secretPhraseToPublicKey,signTransactionBytes} from 'ardorjs';

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

export function getImageURL(nodeurl,fullHash) {
  const params = new URLSearchParams();
  const queryparams = {
    requestType:"downloadTaggedData",
    chain:"IGNIS",
    transactionFullHash:fullHash,
    retrieve:true
  };
  for (const [key, val] of Object.entries(queryparams)) {
      params.append(key, val);
  }
  const url = nodeurl+'?'+params.toString();
  return url;
}


export function getTransactionBytes(nodeurl,query) {
  console.log(nodeurl,query);
  return axios.post(nodeurl, qs.stringify(query), config).then(function(response) {
    return response.data;
  });
}


export function ardorGetIgnisBalance(nodeurl,account){
  return axios.get(nodeurl,{
    params: {
      requestType:"getBalance",
      chain:"IGNIS",
      account:account
      }
  })
  .then(function (response) {
    return response.data;
  });
}

export function ardorGetAccountCurrentAskOrders(nodeurl,account) {
  return axios.get(nodeurl, {
        params: {
          requestType:"getAccountCurrentAskOrders",
          chain:"IGNIS",
          account:account
          }
      })
      .then(function(response) {
        return response.data;
      });
  }

export function ardorGetAccountCurrentBidOrders(nodeurl,account) {
  return axios.get(nodeurl, {
        params: {
          requestType:"getAccountCurrentBidOrders",
          chain:"IGNIS",
          account:account
          }
      })
      .then(function(response) {
        return response.data;
      });
  }

export function ardorGetAskOrders(nodeurl,asset) {
  return axios.get(nodeurl, {
        params: {
          requestType:"getAskOrders",
          chain:"IGNIS",
          asset:asset,
          }
      })
      .then(function(response) {
        return response.data;
      });
  }


export function ardorGetBidOrders(nodeurl,asset) {
  return axios.get(nodeurl, {
        params: {
          requestType:"getBidOrders",
          chain:"IGNIS",
          asset:asset,
          }
      })
      .then(function(response) {
        return response.data;
      });
  }

export function ardorGetAssetsByIssuer(nodeurl,account) {
  return axios.get(nodeurl, {
        params: {
          requestType:"getAssetsByIssuer",
          account:account
          }
      })
      .then(function(response) {
        return response.data.assets[0];
      });
  }


export function ardorGetAccountAssets(nodeurl,account) {
  return axios.get(nodeurl, {
      params: {
        requestType:"getAccountAssets",
        includeAssetInfo:false,
        account:account
        }
    })
    .then(function(response) {
      return response.data.accountAssets;
    })
  }

export function ardorGetAccountCurrencies(nodeurl,account,currency) {
  return axios.get(nodeurl, {
      params: {
        requestType:"getAccountCurrencies",
        account:account,
        currency:currency
        }
    })
    .then(function(response) {
      return response.data;
    })
  }

export function getAccount(nodeurl,accountRs){
  return axios.get(nodeurl, {
    params: {
      requestType:"getAccount",
      account:accountRs
      }
  })
  .then(function(response) {
    return response;
  })
}


export function sendIgnis(nodeurl, amountNQT, recipient, passPhrase, message, messagePrunable=true){
  console.log('sendIgnis()');
  const publicKey = secretPhraseToPublicKey(passPhrase);
  var query = {
    chain:2,
    recipient:recipient,
    amountNQT:amountNQT,
    feeNQT:-1,
    deadline:15,
    broadcast:false,
    publicKey:publicKey,
    message:message,
    messageIsPrunable:messagePrunable
  };
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  console.log('get minimumFee');
  const url_sendmoney = nodeurl+'?requestType=sendMoney';
  const url_broadcast = nodeurl+'?requestType=broadcastTransaction';
  return axios.post(url_sendmoney, qs.stringify(query), config)
          .then(function(response) {
            query.feeNQT = response.data.minimumFeeFQT;
            query.broadcast = false;
            console.log('get transactionBytes');
            return axios.post(url_sendmoney, qs.stringify(query), config)
                .then(function(response){
                  const signed = signTransactionBytes(response.data.unsignedTransactionBytes, passPhrase);
                  var txdata;
                  if (message !==""){
                    let txattachment = JSON.stringify(response.data.transactionJSON.attachment);
                    txdata = {transactionBytes:signed, prunableAttachmentJSON:txattachment};
                  }
                  else {
                    txdata = {transactionBytes:signed};
                  }
                  console.log("sending signed transaction");
                  return axios.post(url_broadcast, qs.stringify(txdata), config)
                        .then(function(response){
                          return response;
                        })
                })
          });
  }


export function transferCurrency(nodeurl, currency, unitsQNT, recipient, passPhrase, message="", messagePrunable=true){
  console.log('transferCurrency()');
  const publicKey = secretPhraseToPublicKey(passPhrase);
  var query = {
    chain:2,
    recipient:recipient,
    currency:currency,
    unitsQNT:unitsQNT,
    feeNQT:-1,
    deadline:15,
    broadcast:false,
    publicKey:publicKey,
    message:message,
    messageIsPrunable:messagePrunable
  };
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  console.log('get minimumFee');
  const url_sendmoney = nodeurl+'?requestType=transferCurrency';
  const url_broadcast = nodeurl+'?requestType=broadcastTransaction';
  return axios.post(url_sendmoney, qs.stringify(query), config)
          .then(function(response) {
            query.feeNQT = response.data.minimumFeeFQT;
            query.broadcast = false;
            console.log('get transactionBytes');
            return axios.post(url_sendmoney, qs.stringify(query), config)
                .then(function(response){
                  const signed = signTransactionBytes(response.data.unsignedTransactionBytes, passPhrase);
                  var txdata;
                  if (message !==""){
                    let txattachment = JSON.stringify(response.data.transactionJSON.attachment);
                    txdata = {transactionBytes:signed, prunableAttachmentJSON:txattachment};
                  }
                  else {
                    txdata = {transactionBytes:signed};
                  }
                  console.log("sending signed transaction");
                  return axios.post(url_broadcast, qs.stringify(txdata), config)
                        .then(function(response){
                          return response;
                        })
                })
          });
  }

export function getAsset(nodeurl,asset){
  return axios.get(nodeurl, {
    params: {
      requestType:"getAsset",
      asset:asset
      }
  })
  .then(function(response) {
    return response;
  })
}

export function getCurrency(nodeurl,currency){
  return axios.get(nodeurl, {
    params: {
      requestType:"getCurrency",
      currency:currency
      }
  })
  .then(function(response) {
    return response;
  })
}

export function transferAsset(nodeurl,asset,quantityQNT,recipient,passPhrase,message='',messagePrunable=true) {
    console.log('transferAsset(): '+asset);
    console.log('get publicKey');
    const publicKey = secretPhraseToPublicKey(passPhrase);

    var query = {
      chain:2,
      recipient:recipient,
      quantityQNT:quantityQNT,
      asset:asset,
      feeNQT:-1,
      deadline:15,
      broadcast:false,
      publicKey:publicKey,
      message:message,
      messageIsPrunable:messagePrunable
    };
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    console.log('get minimumFee');
    const url_tx = nodeurl+'?requestType=transferAsset';
    const url_broadcast = nodeurl+'?requestType=broadcastTransaction';
    return axios.post(url_tx, qs.stringify(query), config)
        .then(function(response) {
          query.feeNQT = response.data.minimumFeeFQT;
          query.broadcast = false;
          console.log('get transactionBytes');
          return axios.post(url_tx, qs.stringify(query), config)
            .then(function(response){
              const signed = signTransactionBytes(response.data.unsignedTransactionBytes, passPhrase);
              var txdata;
              if (message !==""){
                let txattachment = JSON.stringify(response.data.transactionJSON.attachment);
                txdata = {transactionBytes:signed, prunableAttachmentJSON:txattachment};
              }
              else {
                txdata = {transactionBytes:signed};
              }
              console.log("sending signed transaction");
              return axios.post(url_broadcast, qs.stringify(txdata), config)
                  .then(function(response){
                    return response;
                });
          });
    });
}

export function getBlockchainTransactions(nodeurl,chain,account,executedOnly,timestamp) {
  return axios.get(nodeurl, {
    params: {
      requestType:"getBlockchainTransactions",
      chain:chain,
      account:account,
      executedOnly:executedOnly,
      timestamp:timestamp
    }
  })
  .then(function(response) {
    return response.data;
  })
}

export function getUnconfirmedTransactions(nodeurl,chain,account,type,subtype) {
  return axios.get(nodeurl, {
    params: {
      requestType:"getUnconfirmedTransactions",
      chain:chain,
      account:account,
      type:type,
      subtype:subtype
    }
  })
  .then(function(response) {
    return response.data;
  })
}

export function getConstants(nodeurl){
  return axios.get(nodeurl, {
    params: {
      requestType:"getConstants"
    }
  })
  .then(function(response) {
    return response;
  })
}

export function getBlockchainStatus(nodeurl){
  return axios.get(nodeurl, {
    params: {
      requestType:"getBlockchainStatus"
      }
  })
  .then(function(response) {
    return response;
  });
}

