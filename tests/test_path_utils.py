"""Tests for the centralized path encoding/decoding helpers."""

import pytest

from app.path_utils import (
    decode_path_byte,
    first_hop_hex,
    infer_hash_size,
    path_wire_len,
    split_path_hex,
)


class TestDecodePathByte:
    """Test decoding the packed [hash_mode:2][hop_count:6] byte."""

    def test_mode0_single_hop(self):
        """Mode 0 (1-byte hops), 1 hop → path_byte = 0x01."""
        hop_count, hash_size = decode_path_byte(0x01)
        assert hop_count == 1
        assert hash_size == 1

    def test_mode0_three_hops(self):
        """Mode 0, 3 hops → path_byte = 0x03."""
        hop_count, hash_size = decode_path_byte(0x03)
        assert hop_count == 3
        assert hash_size == 1

    def test_mode0_zero_hops(self):
        """Mode 0, 0 hops (direct) → path_byte = 0x00."""
        hop_count, hash_size = decode_path_byte(0x00)
        assert hop_count == 0
        assert hash_size == 1

    def test_mode1_two_byte_hops(self):
        """Mode 1 (2-byte hops), 2 hops → path_byte = 0x42."""
        hop_count, hash_size = decode_path_byte(0x42)
        assert hop_count == 2
        assert hash_size == 2

    def test_mode1_single_hop(self):
        """Mode 1 (2-byte hops), 1 hop → path_byte = 0x41."""
        hop_count, hash_size = decode_path_byte(0x41)
        assert hop_count == 1
        assert hash_size == 2

    def test_mode2_three_byte_hops(self):
        """Mode 2 (3-byte hops), 1 hop → path_byte = 0x81."""
        hop_count, hash_size = decode_path_byte(0x81)
        assert hop_count == 1
        assert hash_size == 3

    def test_mode2_max_hops(self):
        """Mode 2, 63 hops (maximum) → path_byte = 0xBF."""
        hop_count, hash_size = decode_path_byte(0xBF)
        assert hop_count == 63
        assert hash_size == 3

    def test_mode3_reserved_raises(self):
        """Mode 3 is reserved and should raise ValueError."""
        with pytest.raises(ValueError, match="Reserved path hash mode 3"):
            decode_path_byte(0xC0)

    def test_mode3_with_hops_raises(self):
        """Mode 3 with hop count should also raise."""
        with pytest.raises(ValueError, match="Reserved"):
            decode_path_byte(0xC5)

    def test_backward_compat_old_firmware(self):
        """Old firmware packets have upper bits = 0, so mode=0 and path_byte = hop count."""
        for n in range(0, 64):
            hop_count, hash_size = decode_path_byte(n)
            assert hop_count == n
            assert hash_size == 1


class TestPathWireLen:
    def test_basic(self):
        assert path_wire_len(3, 1) == 3
        assert path_wire_len(2, 2) == 4
        assert path_wire_len(1, 3) == 3
        assert path_wire_len(0, 1) == 0


class TestSplitPathHex:
    def test_one_byte_hops(self):
        assert split_path_hex("1a2b3c", 3) == ["1a", "2b", "3c"]

    def test_two_byte_hops(self):
        assert split_path_hex("1a2b3c4d", 2) == ["1a2b", "3c4d"]

    def test_three_byte_hops(self):
        assert split_path_hex("1a2b3c4d5e6f", 2) == ["1a2b3c", "4d5e6f"]

    def test_empty_path(self):
        assert split_path_hex("", 0) == []
        assert split_path_hex("", 3) == []

    def test_zero_hop_count(self):
        assert split_path_hex("1a2b", 0) == []

    def test_inconsistent_length_falls_back(self):
        """If hex length doesn't divide evenly by hop_count, fall back to 2-char chunks."""
        assert split_path_hex("1a2b3c", 2) == ["1a", "2b", "3c"]

    def test_single_hop_one_byte(self):
        assert split_path_hex("ab", 1) == ["ab"]

    def test_single_hop_two_bytes(self):
        assert split_path_hex("abcd", 1) == ["abcd"]


class TestFirstHopHex:
    def test_one_byte_hops(self):
        assert first_hop_hex("1a2b3c", 3) == "1a"

    def test_two_byte_hops(self):
        assert first_hop_hex("1a2b3c4d", 2) == "1a2b"

    def test_empty(self):
        assert first_hop_hex("", 0) is None
        assert first_hop_hex("", 1) is None

    def test_direct_path(self):
        assert first_hop_hex("", 0) is None


class TestInferHashSize:
    def test_one_byte(self):
        assert infer_hash_size("1a2b3c", 3) == 1

    def test_two_byte(self):
        assert infer_hash_size("1a2b3c4d", 2) == 2

    def test_three_byte(self):
        assert infer_hash_size("1a2b3c4d5e6f", 2) == 3

    def test_empty_defaults_to_1(self):
        assert infer_hash_size("", 0) == 1

    def test_inconsistent_defaults_to_1(self):
        assert infer_hash_size("1a2b3", 2) == 1

    def test_zero_hop_count_defaults_to_1(self):
        assert infer_hash_size("1a2b", 0) == 1
