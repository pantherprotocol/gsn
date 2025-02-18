import { RelayRequest } from '@opengsn/common/dist/EIP712/RelayRequest'
import { ecsign, keccak256, toRpcSig, PrefixedHexString } from 'ethereumjs-util'
import { ForwardRequest } from '@opengsn/common/dist/EIP712/ForwardRequest'
import { RelayData } from '@opengsn/common/dist/EIP712/RelayData'

/**
 * sign a relay request, so that VerifyingPaymaster will accept it.
 * This method should be called on a server after performing verification of the request.
 * the signerPrivateKey is the private-key of the signer passed to VerifyingPaymaster.setSigner()
 */
export function signRelayRequest (relayRequest: RelayRequest, signerPrivateKey: Buffer): PrefixedHexString {
  const sig = ecsign(getRequestHash(relayRequest), signerPrivateKey)
  return toRpcSig(sig.v, sig.r, sig.s)
}

export function getRequestHash (relayRequest: RelayRequest): Buffer {
  return keccak256(Buffer.concat([
    Buffer.from(packForwardRequest(relayRequest.request).slice(2), 'hex'),
    Buffer.from(packRelayData(relayRequest.relayData).slice(2), 'hex')
  ]))
}

export function packForwardRequest (req: ForwardRequest): string {
  return web3.eth.abi.encodeParameters(
    ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
    [req.from, req.to, req.value, req.gas, req.nonce, req.data])
}

export function packRelayData (data: RelayData): string {
  return web3.eth.abi.encodeParameters(
    ['uint256', 'uint256', 'uint256', 'address', 'address', 'bytes', 'uint256'],
    [data.gasPrice, data.pctRelayFee, data.baseRelayFee, data.relayWorker, data.paymaster, data.paymasterData, data.clientId])
}
