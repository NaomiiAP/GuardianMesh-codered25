import socket
import struct
import time
import json
from collections import defaultdict
import threading
import sys

# Dictionary to store traffic statistics
traffic_stats = defaultdict(lambda: {
    "BytesSent": 0, "BytesReceived": 0, "PacketsSent": 0, 
    "PacketsReceived": 0, "StartTime": None, "Duration": 0
})

# Lock for thread safety
lock = threading.Lock()

def parse_ethernet_header(packet):
    """Extract Source MAC, Destination MAC, and Ethernet protocol."""
    eth_length = 14  # Ethernet header length
    eth_header = packet[:eth_length]
    eth = struct.unpack('!6s6sH', eth_header)
    dest_mac = ':'.join(format(b, '02x') for b in eth[0])  # Destination MAC
    src_mac = ':'.join(format(b, '02x') for b in eth[1])   # Source MAC
    eth_protocol = socket.ntohs(eth[2])
    return src_mac, dest_mac, eth_protocol, packet[eth_length:]

def update_stats(src_mac, dest_mac, packet_len, direction):
    """Update traffic statistics for a communication."""
    key = (src_mac, dest_mac)
    with lock:
        stats = traffic_stats[key]
        current_time = time.time()
        
        if stats["StartTime"] is None:
            stats["StartTime"] = current_time
        
        if direction == "sent":
            stats["BytesSent"] += packet_len
            stats["PacketsSent"] += 1
        elif direction == "received":
            stats["BytesReceived"] += packet_len
            stats["PacketsReceived"] += 1
        
        stats["Duration"] = current_time - stats["StartTime"]
        
        # Print updated statistics immediately
        print(json.dumps(format_stats_as_json(), indent=4))
        sys.stdout.flush()  # Ensure the output is flushed immediately

def format_stats_as_json():
    """Format traffic statistics as JSON."""
    result = []
    for key, value in traffic_stats.items():
        result.append({
            "SourceMAC": key[0],
            "DestinationMAC": key[1],
            "BytesSent": value["BytesSent"],
            "BytesReceived": value["BytesReceived"],
            "PacketsSent": value["PacketsSent"],
            "PacketsReceived": value["PacketsReceived"],
            "Duration": round(value["Duration"], 2)
        })
    return result

def capture_traffic():
    """Capture packets and extract required details."""
    s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(0x0003))
    
    print("Capturing traffic... Press Ctrl+C to stop.")
    sys.stdout.flush()  # Flush the output buffer at the start
    try:
        while True:
            # Capture packet
            packet, _ = s.recvfrom(65565)
            
            # Parse Ethernet header
            src_mac, dest_mac, eth_protocol, payload = parse_ethernet_header(packet)
            
            # Update statistics for packets (assuming bi-directional communication)
            packet_length = len(packet)
            update_stats(src_mac, dest_mac, packet_length, "sent")
            update_stats(dest_mac, src_mac, packet_length, "received")
    except KeyboardInterrupt:
        print("\nStopped capturing traffic.")
        print("Final Traffic Statistics in JSON:")
        print(json.dumps(format_stats_as_json(), indent=4))
        sys.stdout.flush()  # Ensure final output is flushed

# Start capturing traffic
capture_traffic()
