
const dns = require('dns');

// Force using Google DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('✅ Set custom DNS servers to 8.8.8.8');
} catch (e) {
    console.error('❌ Failed to set custom DNS servers:', e);
}

const domain = '_mongodb._tcp.cluster0.gz2eneq.mongodb.net';

console.log(`Resolving SRV for ${domain}...`);

dns.resolveSrv(domain, (err, addresses) => {
    if (err) {
        console.error('❌ SRV Resolution Failed:', err);
        return;
    }

    console.log('✅ SRV Records Found:');
    addresses.forEach(a => console.log(JSON.stringify(a)));
});
