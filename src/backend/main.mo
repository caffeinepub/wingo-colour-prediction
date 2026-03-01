import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Constants
  let initialBalance = 1000;
  let roundDuration = 30_000_000_000; // 30 seconds in nanoseconds

  // Types
  type BetType = {
    #number : Nat;
    #colour : Colour;
  };

  type Colour = {
    #red;
    #green;
    #violet;
  };

  type RoundStatus = {
    #open;
    #closed;
    #resolved;
  };

  type Bet = {
    user : Principal;
    roundId : Nat;
    betType : BetType;
    amount : Nat;
    result : ?Nat; // Winning number
    payout : Nat;
  };

  module Bet {
    public func compare(bet1 : Bet, bet2 : Bet) : Order.Order {
      switch (Int.compare(bet1.roundId, bet2.roundId)) {
        case (#equal) { Nat.compare(bet1.amount, bet2.amount) };
        case (order) { order };
      };
    };
  };

  type Round = {
    id : Nat;
    status : RoundStatus;
    bets : [Bet];
    result : ?Nat;
    startTime : Int;
  };

  module Round {
    public func compareByStartTime(round1 : Round, round2 : Round) : Order.Order {
      Int.compare(round1.startTime, round2.startTime);
    };
  };

  type UserProfile = {
    balance : Nat;
    betHistory : [Bet];
  };

  module UserProfile {
    public func compareByBalance(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Nat.compare(profile2.balance, profile1.balance); // Descending order
    };
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let rounds = Map.empty<Nat, Round>();
  var currentRoundId = 0;
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only: Start new round
  public shared ({ caller }) func startNewRound() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can start a new round");
    };

    let newRound = {
      id = currentRoundId;
      status = #open;
      bets = [];
      result = null;
      startTime = Time.now();
    };

    rounds.add(currentRoundId, newRound);
    currentRoundId += 1;
  };

  // Public query: Anyone can view current round
  public query func getCurrentRound() : async Round {
    switch (rounds.get(currentRoundId - 1)) {
      case (null) {
        Runtime.trap("Round does not exist");
      };
      case (?round) {
        round;
      };
    };
  };

  // User-only: Place bet
  public shared ({ caller }) func placeBet(betType : BetType, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place bets");
    };

    if (amount == 0) {
      Runtime.trap("Bet amount must be greater than 0");
    };

    let userProfile = await getOrCreateProfile(caller);

    if (amount > userProfile.balance) {
      Runtime.trap("Insufficient balance");
    };

    let currentRound = await getCurrentRound();

    if (currentRound.status != #open) {
      Runtime.trap("Cannot place bet, round is not open");
    };

    let updatedProfile = {
      balance = userProfile.balance - amount;
      betHistory = userProfile.betHistory;
    };
    userProfiles.add(caller, updatedProfile);

    let newBet = {
      user = caller;
      roundId = currentRoundId - 1;
      betType;
      amount;
      result = null;
      payout = 0;
    };

    let updatedRound = {
      id = currentRound.id;
      status = currentRound.status;
      bets = currentRound.bets.concat([newBet]);
      result = currentRound.result;
      startTime = currentRound.startTime;
    };
    rounds.add(currentRoundId - 1, updatedRound);
  };

  // Admin-only: Resolve round
  public shared ({ caller }) func resolveRound(result : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can resolve rounds");
    };

    let currentRound = await getCurrentRound();

    if (currentRound.status != #open) {
      Runtime.trap("Round is not open for resolution");
    };

    let updatedRound = {
      id = currentRound.id;
      status = #resolved;
      bets = [];
      result = ?result;
      startTime = currentRound.startTime;
    };
    rounds.add(currentRoundId - 1, updatedRound);

    await processBets(currentRound.bets, result);
  };

  func processBets(bets : [Bet], result : Nat) : async () {
    for (bet in bets.values()) {
      let isWin = switch (bet.betType) {
        case (#number(num)) { num == result };
        case (#colour(colour)) { colour == mapNumberToColour(result) };
      };

      if (isWin) {
        let payout = switch (bet.betType) {
          case (#number(_) ) { bet.amount * 9 };
          case (#colour(_)) { bet.amount * 2 };
        };

        let user = bet.user;
        let userProfile = switch (userProfiles.get(user)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) { profile };
        };

        let updatedBalance = userProfile.balance + payout;
        let updatedProfile = {
          balance = updatedBalance;
          betHistory = userProfile.betHistory.concat([{ bet with result = ?result; payout }]);
        };
        userProfiles.add(user, updatedProfile);
      } else {
        let user = bet.user;
        let userProfile = switch (userProfiles.get(user)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) { profile };
        };

        let updatedProfile = {
          balance = userProfile.balance;
          betHistory = userProfile.betHistory.concat([{ bet with result = ?result }]);
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  // Helper functions
  func getOrCreateProfile(user : Principal) : async UserProfile {
    switch (userProfiles.get(user)) {
      case (?profile) { profile };
      case (null) {
        let newProfile = {
          balance = initialBalance;
          betHistory = [];
        };
        userProfiles.add(user, newProfile);
        newProfile;
      };
    };
  };

  func mapNumberToColour(number : Nat) : Colour {
    switch (number) {
      case (1 or 3 or 7 or 9) { #red };
      case (2 or 4 or 6 or 8) { #green };
      case (0 or 5) { #violet };
      case (_) { Runtime.trap("Invalid number") };
    };
  };

  // Public query: Anyone can view leaderboard
  public query func getLeaderboard() : async [(Principal, Nat)] {
    let sorted = userProfiles.entries().toArray().sort(
      func((_, profile1), (_, profile2)) {
        UserProfile.compareByBalance(profile1, profile2);
      }
    ).map(
      func((principal, userProfile)) {
        (principal, userProfile.balance);
      }
    );

    sorted.sliceToArray(0, 10);
  };

  // Fetch user bet history with ownership verification
  public query ({ caller }) func getBetHistory(user : Principal) : async [Bet] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bet history");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
    profile.betHistory.sort();
  };

  // Admin-only: Round timeout logic
  public shared ({ caller }) func checkRoundTimeout() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check round timeout");
    };

    let currentRound = await getCurrentRound();

    if (
      currentRound.status == #open and
      (Time.now() - currentRound.startTime) > roundDuration
    ) {
      let updatedRound = {
        id = currentRound.id;
        status = #closed;
        bets = currentRound.bets;
        result = currentRound.result;
        startTime = currentRound.startTime;
      };
      rounds.add(currentRoundId - 1, updatedRound);
    };
  };
};
