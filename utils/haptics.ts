import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Safe, platform-guarded Haptics utility for Foodie app (M6 Motion & Haptics).
 * Automatically checks for platform support, prevents crashes on web,
 * and handles permission or availability errors gracefully.
 */

class HapticsService {
  private enabled: boolean = true;

  /**
   * Enable or disable haptic feedback globally (e.g. for accessibility or user preference)
   */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled && Platform.OS !== 'web';
  }

  /**
   * Heart favorite toggle feedback
   * Light selection tap for instant tactile confirmation
   */
  public async favorite(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Cook Mode step navigation feedback
   * Subtle light tap when moving forward or backward through cooking steps
   */
  public async stepChange(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Cook Mode timer finished feedback
   * Distinct success notification vibration when countdown reaches zero
   */
  public async timerComplete(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Tab bar or Category tab switch feedback
   * Soft selection feedback on tab change
   */
  public async tabChange(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Servings scaler or multiplier change feedback
   */
  public async servingsChange(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Pull-to-refresh trigger feedback
   * Success notification pulse on refresh release
   */
  public async refresh(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Destructive action confirmation feedback (e.g. recipe delete)
   * Warning vibration to give tactile caution
   */
  public async destructive(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Generic button press light impact
   */
  public async buttonPress(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Light impact
   */
  public async impactLight(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Success notification feedback
   */
  public async notificationSuccess(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Medium impact (e.g. Start Cooking button or timer start)
   */
  public async impactMedium(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Selection feedback for chips and radio toggles
   */
  public async selection(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Form success feedback
   */
  public async formSuccess(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Celebration / Completion feedback
   */
  public async celebration(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore unsupported device errors
    }
  }

  /**
   * Heavy impact
   */
  public async impactHeavy(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore unsupported device errors
    }
  }
}

export const haptics = new HapticsService();
export default haptics;
