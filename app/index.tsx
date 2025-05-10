import { useTheme } from "@react-navigation/native";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { tournamentData } from "../mock/tournamentData";

const ScreenWidth = Dimensions.get("window").width;
const MatchBoxWidth = ScreenWidth / 2.6;
const MatchBoxHeight = 110;
const HalfMatchBoxHeight = MatchBoxHeight / 2;
const TentacleWidth = 30;
const SnapTo = MatchBoxWidth + TentacleWidth * 2 + 5;
const lineRadius = 8;
const rangeArray = [3, 2, 1, 0, -1, -2, -3];

interface MatchData {
  player1: string;
  player2: string;
}

interface MatchInfo {
  key: string;
  matchData: MatchData;
  isFirstRound: boolean;
  isFirstMatch: boolean;
  isLastMatch: boolean;
}

interface RoundInfo {
  key: number;
  roundMatches: MatchInfo[];
}

const formattedTournamentData = (rounds: any[]): RoundInfo[] => {
  return rounds.map((round, roundIndex) => {
    const matches = round.matches;
    const roundMatches = matches.map((matchData: any, matchIndex: number) => {
      return {
        key: `${roundIndex}-${matchIndex}`,
        matchData,
        isFirstRound: roundIndex === 0,
        isFirstMatch: matchIndex === 0,
        isLastMatch: matches.length - 1 === matchIndex,
      };
    });

    return {
      key: roundIndex,
      roundMatches,
    };
  });
};

const customMargin = (rootIndex: number, scrollX: SharedValue<number>) => {
  "worklet";

  const inputRange = rangeArray.map((distance) => {
    return SnapTo * (rootIndex - distance);
  });

  const outputRange = rangeArray.map((distance) => {
    return Math.pow(2, distance - 1) * MatchBoxHeight - HalfMatchBoxHeight;
  });

  return interpolate(
    scrollX.value,
    inputRange,
    outputRange,
    Extrapolation.CLAMP
  );
};

interface BracketProps {
  match: MatchInfo;
  roundIndex: number;
  scrollX: SharedValue<number>;
  matchIndex: number;
}

const Brackets = ({ match, roundIndex, scrollX, matchIndex }: BracketProps) => {
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const marginVertical = customMargin(roundIndex, scrollX);
    return {
      marginVertical: marginVertical,
    };
  });

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          left: roundIndex % 2 === 0 ? -1.2 : -1,
          backgroundColor: theme.colors.background,
          opacity: match.isFirstRound ? 0 : 1,
        }}
      >
        <View
          style={{
            width: TentacleWidth,
            height: 20,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomLeftRadius: lineRadius,
          }}
        />
        <View
          style={{
            width: TentacleWidth,
            height: 20,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderBottomWidth: 0,
            borderRightWidth: 0,
            borderTopLeftRadius: lineRadius,
          }}
        />
      </View>
      <Animated.View style={animatedStyle}>
        <View style={styles.matchBoxContainer}>
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: theme.colors.primary,
              position: "absolute",
            }}
          />
          <View
            style={[
              styles.matchBox,
              {
                backgroundColor: theme.colors.card,
                boxShadow: `0px 0px 1px 0px ${theme.colors.border}`,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.playerContainer,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.playerText, { color: theme.colors.text }]}>
                {match.matchData.player1}
              </Text>
            </View>
            <View style={styles.playerContainer}>
              <Text style={[styles.playerText, { color: theme.colors.text }]}>
                {match.matchData.player2}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={{ height: "100%" }}>
        <View
          style={{
            flex: 1,
            width: TentacleWidth,
            borderWidth: 1,
            borderColor: match.isFirstMatch
              ? "transparent"
              : matchIndex % 2 === 0
              ? "transparent"
              : theme.colors.primary,
            alignSelf: "baseline",
            borderLeftWidth: 0,
            borderTopWidth: 0,
            borderBottomRightRadius: lineRadius,
            bottom: matchIndex % 2 === 0 ? 1 : -1,
          }}
        />
        <View
          style={{
            flex: 1,
            width: TentacleWidth,
            borderWidth: 1,
            borderColor: match.isLastMatch
              ? "transparent"
              : matchIndex % 2 === 0
              ? theme.colors.primary
              : "transparent",
            alignSelf: "baseline",
            borderLeftWidth: 0,
            borderBottomWidth: 0,
            borderTopEndRadius: lineRadius,
          }}
        />
      </View>
    </View>
  );
};

interface RoundsProps {
  round: RoundInfo;
  roundIndex: number;
  scrollX: SharedValue<number>;
}

const Rounds = ({ round, roundIndex, scrollX }: RoundsProps) => {
  return (
    <View>
      {round.roundMatches.map((match, matchIndex) => (
        <Brackets
          key={match.key}
          match={match}
          matchIndex={matchIndex}
          roundIndex={roundIndex}
          scrollX={scrollX}
        />
      ))}
    </View>
  );
};

const Main = () => {
  const scrollX = useSharedValue(0);
  const rounds = tournamentData.rounds;
  const roundData = formattedTournamentData(rounds);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      scrollX.value = contentOffset.x;
    },
  });

  return (
    <Animated.ScrollView
      horizontal
      contentInsetAdjustmentBehavior="automatic"
      snapToInterval={SnapTo}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      snapToAlignment="start"
      decelerationRate="fast"
      directionalLockEnabled={true}
      contentContainerStyle={{
        height: 1750,
        paddingTop: 10,
      }}
    >
      {roundData.map((round, index) => (
        <Rounds
          key={round.key}
          round={round}
          roundIndex={index}
          scrollX={scrollX}
        />
      ))}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  matchBoxContainer: {
    width: MatchBoxWidth,
    height: MatchBoxHeight,
    justifyContent: "center",
  },
  playerText: {
    fontSize: 14,
  },
  matchBox: {
    borderRadius: lineRadius,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  playerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});

export default Main;
