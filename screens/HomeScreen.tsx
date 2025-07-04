import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  Modal, 
  Linking, 
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;
const AFFILIATE_URL = 'https://www.jitbuzz.com/affiliate_code?affiliate_code=BL6YrCAQXR';

// Define wheel segments with their point values and colors
const WHEEL_SEGMENTS = [
  { points: '4,000', backgroundColor: '#FF4136', textColor: '#FFFFFF' },
  { points: '10,000', backgroundColor: '#FFDC00', textColor: '#1E0E4B' },
  { points: '15,000', backgroundColor: '#0074D9', textColor: '#FFFFFF' },
  { points: '1,000', backgroundColor: '#2ECC40', textColor: '#1E0E4B' },
  { points: '50,000', backgroundColor: '#F012BE', textColor: '#FFFFFF' },
  { points: '500', backgroundColor: '#FF851B', textColor: '#1E0E4B' },
  { points: '5,000', backgroundColor: '#7FDBFF', textColor: '#1E0E4B' },
  { points: '2,000', backgroundColor: '#B10DC9', textColor: '#FFFFFF' },
];

// Confetti component for celebration effects
const Confetti = ({ active }) => {
  const confettiCount = 50;
  const confettiPieces = Array.from({ length: confettiCount });
  const animations = useRef(confettiPieces.map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    if (active) {
      const animations = confettiPieces.map((_, i) => {
        const animation = new Animated.Value(0);
        
        Animated.timing(animation, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
          easing: Easing.linear
        }).start();
        
        return animation;
      });
    }
  }, [active]);
  
  return active ? (
    <View style={StyleSheet.absoluteFill}>
      {confettiPieces.map((_, i) => {
        const translateX = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [Math.random() * width - width/2, Math.random() * width - width/2]
        });
        
        const translateY = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-20, width]
        });
        
        const rotate = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${Math.random() * 360}deg`]
        });
        
        const opacity = animations[i].interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0]
        });
        
        const size = 10 + Math.random() * 10;
        const color = ['#FF4136', '#FFDC00', '#0074D9', '#2ECC40', '#F012BE'][Math.floor(Math.random() * 5)];
        
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? size/2 : 0,
              transform: [{ translateX }, { translateY }, { rotate }],
              opacity
            }}
          />
        );
      })}
    </View>
  ) : null;
};

// Wheel segment component with 3D text
const WheelSegment = ({ segment, index, totalSegments }) => {
  const angle = index * (360 / totalSegments);
  
  return (
    <View 
      style={[
        styles.wheelSegment, 
        { 
          transform: [{ rotate: `${angle}deg` }],
        }
      ]} 
    >
      {/* Segment with gradient effect */}
      <View style={[
        styles.segmentContent,
        { backgroundColor: segment.backgroundColor }
      ]}>
        {/* Highlight effect */}
        <View style={styles.segmentHighlight} />
      </View>
      
      {/* Divider line */}
      <View style={styles.dividerLine} />
      
      {/* Points text with 3D effect */}
      <View style={styles.pointsContainer}>
        {/* Shadow layer for 3D effect */}
        <Text style={[
          styles.pointsTextShadow,
          { color: 'rgba(0, 0, 0, 0.5)' }
        ]}>
          {segment.points}
        </Text>
        
        {/* Main text */}
        <Text style={[
          styles.pointsText, 
          { color: segment.textColor }
        ]}>
          {segment.points}
        </Text>
        
        <Text style={[
          styles.pointsLabel, 
          { color: segment.textColor }
        ]}>
          pts
        </Text>
      </View>
    </View>
  );
};

export default function PlayFunSpinToWin() {
  const [showPopup, setShowPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prizeWon, setPrizeWon] = useState('500');
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Function to handle wheel spin
  const spinWheel = () => {
    // Reset the spin value
    spinValue.setValue(0);
    
    // Spin the wheel with a random number of rotations (3-5 full rotations)
    const randomRotations = 3 + Math.random() * 2;
    
    // Calculate which segment will be selected
    const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const selectedPrize = WHEEL_SEGMENTS[segmentIndex].points;
    
    Animated.timing(spinValue, {
      toValue: randomRotations,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      // Show popup and confetti after spin completes
      setPrizeWon(selectedPrize);
      setShowPopup(true);
      setShowConfetti(true);
    });
  };

  // Function to close popup and reset
  const closePopup = () => {
    setShowPopup(false);
    setShowConfetti(false);
  };
  
  // Interpolate the spin value to rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Function to handle button press
  const handleButtonPress = () => {
    Linking.openURL(AFFILIATE_URL).catch(err => console.error("Couldn't open URL", err));
    closePopup();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E0E4B" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Play Fun Spin to Win</Text>
      </View>
      
      <View style={styles.wheelContainer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={spinWheel}
          disabled={showPopup}
        >
          <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
            {/* Wheel segments with 3D text */}
            {WHEEL_SEGMENTS.map((segment, index) => (
              <WheelSegment 
                key={index}
                segment={segment}
                index={index}
                totalSegments={WHEEL_SEGMENTS.length}
              />
            ))}
            
            {/* Center of wheel */}
            <View style={styles.wheelCenter}>
              <Text style={styles.spinText}>TAP TO SPIN</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
        
        <View style={styles.wheelPointer}>
          <Ionicons name="caret-down" size={40} color="#FF4136" />
        </View>
      </View>
      
      <Text style={styles.instructionText}>
        Tap the wheel to spin and win exciting prizes!
      </Text>
      
      {/* Popup Modal */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.congratsText}>🎉 Congratulations!</Text>
            <Text style={styles.prizeText}>You have won {prizeWon} Points!</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.claimButton]} 
                onPress={handleButtonPress}
              >
                <Text style={styles.buttonText}>🔴 Claim Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.signupButton]} 
                onPress={handleButtonPress}
              >
                <Text style={styles.buttonText}>🔵 Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Confetti effect */}
      <Confetti active={showConfetti} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E0E4B',
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#FFD700',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  wheelSegment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    left: '50%',
    top: 0,
    transformOrigin: 'bottom left',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'visible',
  },
  segmentContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  segmentHighlight: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    left: 0,
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerLine: {
    position: 'absolute',
    height: '100%',
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    left: 0,
    top: 0,
  },
  pointsContainer: {
    position: 'absolute',
    top: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    transform: [{ rotateZ: '-90deg' }],
  },
  pointsTextShadow: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    top: 2,
    left: 2,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  wheelCenter: {
    width: WHEEL_SIZE * 0.3,
    height: WHEEL_SIZE * 0.3,
    borderRadius: (WHEEL_SIZE * 0.3) / 2,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: '#FFC700',
  },
  spinText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1E0E4B',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  wheelPointer: {
    position: 'absolute',
    top: -15,
    zIndex: 100,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E0E4B',
    marginBottom: 10,
    textAlign: 'center',
  },
  prizeText: {
    fontSize: 22,
    color: '#FF4136',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  claimButton: {
    backgroundColor: '#FF4136',
  },
  signupButton: {
    backgroundColor: '#0074D9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});