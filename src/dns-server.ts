import dgram from 'dgram';
import dnsPacket from 'dns-packet';
import localdb from './config/temp-db.js'
import type { StringRecordType } from 'dns-packet';
import redisClient from './config/redis.js';

const PORT : number =  41234; // default port for DNS server



const server = dgram.createSocket('udp4');

server.on('message',async (msg: Buffer, rinfo: dgram.RemoteInfo) => {

    //whole code is divided into 
    // 1. parsing the message
    // 2. decoding
    // 3. searching
    // 4. encoding
    // 5. sending the response back to the client

    if (msg.length < 12) {
        console.log("Not a DNS packet (too short)");
        return;
    }

    try {

        const decoded = dnsPacket.decode(msg);

        if (!decoded || !decoded.questions || decoded.questions.length === 0) {
            console.log("Not a valid DNS query");
            return;
        }

        console.log("Valid DNS query for:", decoded.questions[0]?.name);




        const find = localdb.find((val) => {
            return (val.name === decoded.questions?.[0]?.name && val.type == decoded.questions?.[0]?.type)
        })


        if(!find) return;

        const recordType = (find.type as StringRecordType) || 'A';
        const dataType = (find.name as StringRecordType) || "127.0.0.1";

        const key = JSON.stringify({ name: decoded.questions?.[0]?.name, type: recordType });

        const redisResponse = await redisClient.get(key);

        if (redisResponse) {
            server.send(redisResponse, rinfo.port, rinfo.address);
            return;
        }

        const response = dnsPacket.encode({
            type: 'response',
            id: decoded.id,
            flags: dnsPacket.AUTHORITATIVE_ANSWER,
            questions: [
                {
                    type: recordType,
                    name: decoded.questions?.[0]?.name || ''
                }
            ],
            answers: [
                {
                    type: recordType,
                    name: decoded.questions?.[0]?.name || '',
                    ttl: 300,
                    data: dataType
                }
            ]
        });

        

        await redisClient.set(key, response);

        
        server.send(response, rinfo.port, rinfo.address);

    } catch {
        console.log("Not a DNS packet (decode failed)");
    }


});


server.bind(PORT, () => {
    console.log('DNS server is listening on port 41234');
});
