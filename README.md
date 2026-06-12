# 🔍 Basic Network Sniffer — CodeAlpha Cybersecurity Internship (Task 1)

A Python-based network packet sniffer that captures and analyzes live network traffic using **Scapy**.

---

## 📋 Features

| Feature | Description |
|---|---|
| **Live Capture** | Sniffs packets in real-time on any network interface |
| **Protocol Detection** | Identifies TCP, UDP, ICMP, ARP, IPv4, IPv6 |
| **IP Analysis** | Displays source and destination IP addresses |
| **Port Display** | Shows source/destination ports for TCP/UDP |
| **TCP Flags** | Decodes SYN, ACK, FIN, RST, PSH, URG flags |
| **DNS Snooping** | Extracts DNS query names from UDP port 53 traffic |
| **Payload Peek** | Shows first 80 printable bytes of packet payload |
| **BPF Filtering** | Filter traffic using standard Berkeley Packet Filter syntax |
| **PCAP Export** | Save captured packets to `.pcap` for Wireshark analysis |
| **Statistics** | Prints a per-protocol summary table on exit |
| **Coloured Output** | ANSI-coloured terminal output for easy reading |

---

## 🛠️ Installation

### 1. Install Python 3.7+
```bash
python3 --version
```

### 2. Install Scapy
```bash
pip install scapy
```

### 3. Linux: Install libpcap (if not already present)
```bash
sudo apt install libpcap-dev    # Debian/Ubuntu
sudo yum install libpcap-devel  # RHEL/CentOS
```

---

## 🚀 Usage

> **Root privileges are required** for raw socket access.

```bash
# Capture all traffic (unlimited packets)
sudo python3 network_sniffer.py

# Capture on a specific interface
sudo python3 network_sniffer.py -i eth0

# Capture only 50 packets
sudo python3 network_sniffer.py -c 50

# Filter: only HTTP traffic
sudo python3 network_sniffer.py -f "tcp port 80"

# Filter: only DNS traffic
sudo python3 network_sniffer.py -f "udp port 53"

# Filter: traffic to/from a specific host
sudo python3 network_sniffer.py -f "host 192.168.1.1"

# Save capture to pcap file (open in Wireshark)
sudo python3 network_sniffer.py -c 100 -o capture.pcap

# Verbose mode (full Scapy layer breakdown per packet)
sudo python3 network_sniffer.py -v
```

### All Options

| Flag | Long Form | Description |
|------|-----------|-------------|
| `-i` | `--interface` | Network interface to capture on (default: auto) |
| `-c` | `--count` | Number of packets to capture; `0` = unlimited |
| `-f` | `--filter` | BPF filter string |
| `-o` | `--output` | Save packets to `.pcap` file |
| `-v` | `--verbose` | Verbose Scapy layer output per packet |

---

## 📊 Sample Output

```
╔══════════════════════════════════════════════════════════════╗
║        CodeAlpha — Basic Network Sniffer  (Task 1)          ║
╚══════════════════════════════════════════════════════════════╝
  Interface : eth0
  BPF Filter: (none — capturing all traffic)
  Count     : unlimited

  Press Ctrl-C to stop and view statistics.

  Time         Proto              Source                       Destination
  ─────────────────────────────────────────────────────────────────────
  14:22:01.342  [TCP]          192.168.1.5:54312  →  142.250.74.46:443   Flags=SYN
  14:22:01.344  [TCP]          142.250.74.46:443  →  192.168.1.5:54312   Flags=SYN ACK
  14:22:01.521  [UDP]          192.168.1.5:55621  →  8.8.8.8:53          DNS? google.com
  14:22:01.610  [ICMP]         192.168.1.5        →  192.168.1.1         Type=8 Code=0

═════════════════════════════════════════════════════════════
  CAPTURE SUMMARY
═════════════════════════════════════════════════════════════
  Total packets captured         247
  Duration                       15.32s
  Average rate                   16.1 pkt/s

  Protocol        Count        Share
  ─────────────── ──────────   ────────
  TCP               189         76.5%  ████████████████
  UDP                42         17.0%  ███
  ICMP               12          4.9%  █
  ARP                 4          1.6%
═════════════════════════════════════════════════════════════
```

---

## 🔬 How It Works

```
Network Interface
       │
       ▼
  Scapy sniff()  ←── BPF Filter (optional)
       │
       ▼
 packet_handler()
       │
       ├─── Layer 3 check: IP / IPv6 / ARP
       │         Extract: src_ip, dst_ip
       │
       ├─── Layer 4 check: TCP / UDP / ICMP
       │         Extract: ports, flags, DNS names
       │
       ├─── Payload extraction (printable bytes only)
       │
       ├─── Coloured terminal print
       │
       └─── Stats counter update
                 │
                 ▼
          On exit → Summary table + optional pcap save
```

---

## 🧠 What You Learn From This

- **Packet structure**: How Ethernet frames contain IP packets which contain TCP/UDP segments
- **Protocol hierarchy**: OSI model layers in action
- **BPF filters**: How network capture tools filter traffic efficiently
- **Raw sockets**: Why root access is needed for packet capture
- **Network forensics**: How `.pcap` files store network conversations

---

## ⚠️ Ethical & Legal Notice

> This tool is for **educational and authorized testing purposes only**.
> Sniffing traffic on networks you don't own or have explicit permission to monitor is **illegal** in most jurisdictions.
> Always use tools like this in a controlled lab environment or with written authorization.

---

## 📁 Repository Structure

```
CodeAlpha_NetworkSniffer/
├── network_sniffer.py       ← Main sniffer script
├── README.md                ← This file
└── sample_capture.pcap      ← (Optional) Sample capture file
```

---

## 🔗 References

- [Scapy Documentation](https://scapy.readthedocs.io/)
- [BPF Filter Syntax](https://biot.com/capstats/bpf.html)
- [Wireshark](https://www.wireshark.org/) — for viewing `.pcap` files
