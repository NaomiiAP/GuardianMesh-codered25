import socket
import struct
import time
import json
import threading
import logging

# Threshold for detecting compromised node (e.g., 1000 bytes or 100 packets per second)
TRAFFIC_THRESHOLD_BYTES = 1000
TRAFFIC_THRESHOLD_PACKETS = 50

# Whitelist of trusted MAC addresses (Zero Trust)
TRUSTED_MAC_ADDRESSES = {
    "02:42:ac:13:00:02",  # Example trusted MAC addresses
    "02:42:ac:13:00:06",
    "02:42:ac:13:00:08"
}

# Dictionary to store traffic statistics
traffic_stats = {}

# Dictionary to store isolated status
isolated_nodes = {}

# Lock for thread safety
lock = threading.Lock()

# Set up logging
LOG_FILE_PATH = '/app/blacklisted_macs.log'
logging.basicConfig(filename=LOG_FILE_PATH, level=logging.INFO, 
                    format='%(asctime)s - Blacklisted MAC: %(message)s')

def is_trusted(mac_address):
    """Check if a MAC address is trusted (Zero Trust)."""
    return mac_address in TRUSTED_MAC_ADDRESSES

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
    # Zero Trust: Verify source and destination MAC addresses
    if not is_trusted(src_mac) or not is_trusted(dest_mac):
        print(f"Zero Trust: Untrusted MAC address detected. Source: {src_mac}, Destination: {dest_mac}")
        return  # Ignore traffic from untrusted devices

    key = (src_mac, dest_mac)
    with lock:
        if key not in traffic_stats:
            traffic_stats[key] = {
                "BytesSent": 0, "BytesReceived": 0, "PacketsSent": 0, "PacketsReceived": 0, "StartTime": None, "Duration": 0
            }
        
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
        
        # Check for anomaly detection
        check_anomaly(key)

def check_anomaly(key):
    """Check if traffic statistics exceed the thresholds for anomaly detection."""
    stats = traffic_stats[key]
    if stats["BytesSent"] > TRAFFIC_THRESHOLD_BYTES or stats["PacketsSent"] > TRAFFIC_THRESHOLD_PACKETS:
        if key not in isolated_nodes or not isolated_nodes[key]:
            print(f"Anomaly detected for {key}. Isolating the node.")
            isolate_node(key)
            isolated_nodes[key] = True
    elif stats["BytesSent"] < TRAFFIC_THRESHOLD_BYTES and stats["PacketsSent"] < TRAFFIC_THRESHOLD_PACKETS:
        if key in isolated_nodes and isolated_nodes[key]:
            print(f"Traffic normalized for {key}. Recovering the node.")
            recover_node(key)
            isolated_nodes[key] = False

def isolate_node(key):
    """Simulate isolating the node by blocking its traffic."""
    print(f"Node {key} isolated. Blocking traffic.")
    log_blacklisted_mac(key[0])

def recover_node(key):
    """Simulate recovering the node by restoring its access."""
    print(f"Node {key} recovered. Restoring traffic.")
    log_blacklisted_mac(key[0])  # Log recovery

def log_blacklisted_mac(src_mac):
    """Log the blacklisted MAC address."""
    logging.info(f"MAC: {src_mac} - {'Isolated' if isolated_nodes.get((src_mac, None), False) else 'Recovered'}")

def health_check():
    """Periodically check the status of isolated nodes and recover them if traffic normalizes."""
    while True:
        with lock:
            for key in list(isolated_nodes.keys()):
                stats = traffic_stats.get(key, {})
                if stats.get("BytesSent", 0) < TRAFFIC_THRESHOLD_BYTES and stats.get("PacketsSent", 0) < TRAFFIC_THRESHOLD_PACKETS:
                    if isolated_nodes[key]:
                        print(f"Self-Healing: Traffic normalized for {key}. Recovering the node.")
                        recover_node(key)
                        isolated_nodes[key] = False
        time.sleep(10)  # Check every 10 seconds

def federated_learning_update():
    """Simulate federated learning by sharing anomaly detection thresholds across nodes."""
    global TRAFFIC_THRESHOLD_BYTES, TRAFFIC_THRESHOLD_PACKETS
    while True:
        # Simulate receiving updated thresholds from other nodes (e.g., via MQTT or API)
        new_threshold_bytes = 1200  # Example updated threshold
        new_threshold_packets = 60  # Example updated threshold

        # Update thresholds
        with lock:
            TRAFFIC_THRESHOLD_BYTES = new_threshold_bytes
            TRAFFIC_THRESHOLD_PACKETS = new_threshold_packets
            print(f"Federated Learning: Updated thresholds to Bytes={TRAFFIC_THRESHOLD_BYTES}, Packets={TRAFFIC_THRESHOLD_PACKETS}")

        time.sleep(60)  # Simulate periodic updates (e.g., every 60 seconds)

def capture_traffic():
    """Capture packets and extract required details."""
    s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(0x0003))
    
    print("Capturing traffic... Press Ctrl+C to stop.")
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
        print(json.dumps(traffic_stats, indent=4))

# Start the health check thread
health_check_thread = threading.Thread(target=health_check, daemon=True)
health_check_thread.start()

# Start the federated learning thread
federated_learning_thread = threading.Thread(target=federated_learning_update, daemon=True)
federated_learning_thread.start()

# Start capturing traffic
capture_traffic()