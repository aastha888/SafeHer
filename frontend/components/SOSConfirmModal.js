import React, { useEffect, useRef, useState } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

const HOLD_SECONDS = 3;

// Press-and-hold confirm: user must hold the button for HOLD_SECONDS
// before onConfirm fires. This stops an accidental single tap from
// sending a real SOS alert.
export default function SOSConfirmModal({ visible, onConfirm, onCancel, sending }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to HOLD_SECONDS
  const intervalRef = useRef(null);

  const resetHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setHolding(false);
    setProgress(0);
  };

  // Reset the hold state whenever the modal closes/opens
  useEffect(() => {
    if (!visible) resetHold();
  }, [visible]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startHold = () => {
    if (sending) return;
    setHolding(true);
    setProgress(0);
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= HOLD_SECONDS) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setHolding(false);
        setProgress(0);
        onConfirm();
      } else {
        setProgress(elapsed);
      }
    }, 50);
  };

  const cancelHold = () => {
    resetHold();
  };

  const fillPercent = Math.min((progress / HOLD_SECONDS) * 100, 100);

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={sending ? undefined : onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.icon}>🆘</Text>
              <Text style={styles.title}>Send SOS Alert?</Text>
              <Text style={styles.body}>
                This will immediately notify all your emergency contacts with your
                current location. Only confirm if this is a real emergency.
              </Text>

              <TouchableOpacity
                style={styles.confirmButton}
                activeOpacity={0.85}
                disabled={sending}
                onPressIn={startHold}
                onPressOut={cancelHold}
              >
                {/* Fill bar shows hold progress */}
                <View style={[styles.confirmFill, { width: `${fillPercent}%` }]} />
                <Text style={styles.confirmText}>
                  {sending
                    ? 'Sending SOS...'
                    : holding
                    ? 'Keep holding...'
                    : `Hold ${HOLD_SECONDS}s to Confirm SOS`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={sending}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { ...typography.heading, color: colors.text, marginBottom: 10, textAlign: 'center' },
  body: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 22,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: colors.error,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  confirmFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  confirmText: { ...typography.title, color: '#FFFFFF', fontWeight: '800' },
  cancelButton: { paddingVertical: 10 },
  cancelText: { ...typography.body, color: colors.textLight, fontWeight: '600' },
});