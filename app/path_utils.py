"""
Centralized helpers for MeshCore multi-byte path encoding.

The path_len wire byte is packed as [hash_mode:2][hop_count:6]:
  - hash_size = (hash_mode) + 1  →  1, 2, or 3 bytes per hop
  - hop_count = lower 6 bits     →  0–63 hops
  - wire bytes = hop_count × hash_size

Mode 3 (hash_size=4) is reserved and rejected.
"""


def decode_path_byte(path_byte: int) -> tuple[int, int]:
    """Decode a packed path byte into (hop_count, hash_size).

    Returns:
        (hop_count, hash_size) where hash_size is 1, 2, or 3.

    Raises:
        ValueError: If hash_mode is 3 (reserved).
    """
    hash_mode = (path_byte >> 6) & 0x03
    if hash_mode == 3:
        raise ValueError(f"Reserved path hash mode 3 (path_byte=0x{path_byte:02X})")
    hop_count = path_byte & 0x3F
    hash_size = hash_mode + 1
    return hop_count, hash_size


def path_wire_len(hop_count: int, hash_size: int) -> int:
    """Wire byte length of path data."""
    return hop_count * hash_size


def split_path_hex(path_hex: str, hop_count: int) -> list[str]:
    """Split a hex path string into per-hop chunks using the known hop count.

    If hop_count is 0 or the hex length doesn't divide evenly, falls back
    to 2-char (1-byte) chunks for backward compatibility.
    """
    if not path_hex or hop_count <= 0:
        return []
    chars_per_hop = len(path_hex) // hop_count
    if chars_per_hop < 2 or chars_per_hop % 2 != 0 or chars_per_hop * hop_count != len(path_hex):
        # Inconsistent — fall back to legacy 2-char split
        return [path_hex[i : i + 2] for i in range(0, len(path_hex), 2)]
    return [path_hex[i : i + chars_per_hop] for i in range(0, len(path_hex), chars_per_hop)]


def first_hop_hex(path_hex: str, hop_count: int) -> str | None:
    """Extract the first hop identifier from a path hex string.

    Returns None for empty/direct paths.
    """
    hops = split_path_hex(path_hex, hop_count)
    return hops[0] if hops else None


def infer_hash_size(path_hex: str, hop_count: int) -> int:
    """Derive bytes-per-hop from path hex length and hop count.

    Returns 1 as default for ambiguous or legacy cases.
    """
    if hop_count <= 0 or not path_hex:
        return 1
    hex_per_hop = len(path_hex) // hop_count
    byte_per_hop = hex_per_hop // 2
    if byte_per_hop in (1, 2, 3) and hex_per_hop * hop_count == len(path_hex):
        return byte_per_hop
    return 1
