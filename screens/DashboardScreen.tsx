import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { colors } from '../constants/theme';

const WEDDING_DATE = new Date('2026-12-20T10:00:00');
const COUPLE_NAME_BRIDE = 'Harshitha';
const COUPLE_NAME_GROOM = 'Sphurjith';

const BUDGET_TOTAL = 500000;
const BUDGET_SPENT = 187500;

function getCountdown(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function formatCurrency(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

export default function DashboardScreen() {
  const [countdown, setCountdown] = useState(getCountdown(WEDDING_DATE));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(WEDDING_DATE));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const budgetRemaining = BUDGET_TOTAL - BUDGET_SPENT;
  const spentPercent = (BUDGET_SPENT / BUDGET_TOTAL) * 100;

  const weddingDateStr = WEDDING_DATE.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>WEDDING PLANNER</Text>
          <Text style={styles.ampersandRow}>
            <Text style={styles.brideName}>{COUPLE_NAME_BRIDE}</Text>
            <Text style={styles.ampersand}> & </Text>
            <Text style={styles.groomName}>{COUPLE_NAME_GROOM}</Text>
          </Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerIcon}>💍</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.weddingDate}>{weddingDateStr}</Text>
        </View>

        {/* Countdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Countdown to the Big Day</Text>
          <View style={styles.countdownRow}>
            <CountdownUnit value={countdown.days} label="Days" />
            <Text style={styles.colon}>:</Text>
            <CountdownUnit value={countdown.hours} label="Hours" />
            <Text style={styles.colon}>:</Text>
            <CountdownUnit value={countdown.minutes} label="Mins" />
            <Text style={styles.colon}>:</Text>
            <CountdownUnit value={countdown.seconds} label="Secs" />
          </View>
        </View>

        {/* Budget Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Overview</Text>

          <View style={styles.budgetRow}>
            <BudgetStat
              label="Total Budget"
              amount={BUDGET_TOTAL}
              color={colors.textDark}
            />
            <View style={styles.budgetDivider} />
            <BudgetStat
              label="Spent"
              amount={BUDGET_SPENT}
              color={colors.primary}
            />
            <View style={styles.budgetDivider} />
            <BudgetStat
              label="Remaining"
              amount={budgetRemaining}
              color={colors.success}
            />
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${spentPercent}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{spentPercent.toFixed(1)}% spent</Text>
            <Text style={styles.progressText}>{(100 - spentPercent).toFixed(1)}% remaining</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.countdownUnit}>
      <View style={styles.countdownBox}>
        <Text style={styles.countdownValue}>{String(value).padStart(2, '0')}</Text>
      </View>
      <Text style={styles.countdownLabel}>{label}</Text>
    </View>
  );
}

function BudgetStat({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <View style={styles.budgetStat}>
      <Text style={styles.budgetStatLabel}>{label}</Text>
      <Text style={[styles.budgetStatAmount, { color }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  headerLabel: {
    fontSize: 11,
    letterSpacing: 4,
    color: colors.textLight,
    marginBottom: 16,
    fontWeight: '600',
  },
  ampersandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brideName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    fontStyle: 'italic',
  },
  ampersand: {
    fontSize: 28,
    color: colors.accent,
    fontWeight: '300',
  },
  groomName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    fontStyle: 'italic',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
    width: width * 0.7,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  dividerIcon: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  weddingDate: {
    fontSize: 14,
    color: colors.textMid,
    letterSpacing: 1,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Countdown
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  countdownUnit: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  countdownBox: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  countdownValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  countdownLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 1,
  },
  colon: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 16,
    marginHorizontal: 2,
  },

  // Budget
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  budgetDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.primaryLight,
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  budgetStatAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 99,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
});
