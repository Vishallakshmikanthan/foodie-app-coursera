import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Trash2,
  Share2,
  Plus,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react-native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassIconButton } from '../components/ui/GlassIconButton';
import { GlassSurface } from '../components/ui/GlassSurface';
import { useRecipes } from '../context/RecipeContext';
import { useAppRouter } from '../utils/navigation';
import { ShoppingItem } from '../types/smart';
import { formatShoppingItem } from '../utils/shoppingUtils';
import { palette, typography, radii } from '../theme/tokens';
import { haptics } from '../utils/haptics';

export default function ShoppingListScreen() {
  const router = useAppRouter();
  const {
    shoppingList,
    toggleShoppingItem,
    removeShoppingItem,
    clearCompletedShoppingItems,
    clearAllShoppingItems,
    addToShoppingList,
  } = useRecipes();

  const [customItemText, setCustomItemText] = useState('');

  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of shoppingList) {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    }
    return groups;
  }, [shoppingList]);

  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter((i) => i.isChecked).length;

  const handleToggle = (id: string) => {
    haptics.buttonPress();
    toggleShoppingItem(id);
  };

  const handleRemove = (id: string) => {
    haptics.buttonPress();
    removeShoppingItem(id);
  };

  const handleAddCustomItem = () => {
    const trimmed = customItemText.trim();
    if (!trimmed) return;
    haptics.impactLight();
    addToShoppingList([{ name: trimmed }], undefined, 'Custom Item', 1);
    setCustomItemText('');
  };

  const handleShare = async () => {
    if (shoppingList.length === 0) return;
    haptics.buttonPress();

    const pending = shoppingList.filter((i) => !i.isChecked);
    const completed = shoppingList.filter((i) => i.isChecked);

    let message = '🛒 Foodie Shopping List:\n\n';
    if (pending.length > 0) {
      message += 'Items to buy:\n';
      pending.forEach((item) => {
        message += `• ${formatShoppingItem(item)}${
          item.recipeName ? ` (${item.recipeName})` : ''
        }\n`;
      });
      message += '\n';
    }

    if (completed.length > 0) {
      message += 'Completed:\n';
      completed.forEach((item) => {
        message += `✓ ${formatShoppingItem(item)}\n`;
      });
    }

    try {
      await Share.share({
        title: 'Foodie Shopping List',
        message,
      });
    } catch (e) {
      console.log('Error sharing shopping list:', e);
    }
  };

  const handleClearCompleted = () => {
    haptics.buttonPress();
    clearCompletedShoppingItems();
  };

  const handleClearAll = () => {
    if (shoppingList.length === 0) return;
    haptics.destructive();
    if (Platform.OS === 'web') {
      if (window.confirm('Clear your entire shopping list?')) {
        clearAllShoppingItems();
      }
    } else {
      Alert.alert(
        'Clear Shopping List',
        'Are you sure you want to remove all items from your shopping list?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: () => {
              clearAllShoppingItems();
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.rootContainer}>
      <GradientBackground preset="mint-to-forest" fullScreen />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <GlassIconButton
            icon={ArrowLeft}
            size={42}
            iconSize={20}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            accessibilityLabel="Go back"
          />

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Shopping List</Text>
            <Text style={styles.headerSubtitle}>
              {totalItems === 0
                ? 'No items'
                : `${completedItems}/${totalItems} collected`}
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            {shoppingList.length > 0 && (
              <>
                <GlassIconButton
                  icon={Share2}
                  size={42}
                  iconSize={18}
                  iconColor={palette.peach[300]}
                  onPress={handleShare}
                  accessibilityLabel="Share list"
                />
                <GlassIconButton
                  icon={Trash2}
                  size={42}
                  iconSize={18}
                  iconColor={palette.coral[500]}
                  onPress={handleClearAll}
                  accessibilityLabel="Clear all"
                />
              </>
            )}
          </View>
        </View>

        {/* Add custom item */}
        <View style={styles.addInputRow}>
          <TextInput
            value={customItemText}
            onChangeText={setCustomItemText}
            placeholder="Add ingredient or grocery..."
            placeholderTextColor={palette.gray[500]}
            style={styles.addInput}
            onSubmitEditing={handleAddCustomItem}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAddCustomItem}
            activeOpacity={0.75}
            style={[
              styles.addBtn,
              !customItemText.trim() && styles.addBtnDisabled,
            ]}
            disabled={!customItemText.trim()}
          >
            <Plus size={18} color={palette.forest[900]} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* List Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {totalItems === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <ShoppingBag size={40} color={palette.mint[300]} />
              </View>
              <Text style={styles.emptyTitle}>Your basket is empty</Text>
              <Text style={styles.emptySub}>
                Visit any recipe details page and tap "Add to Shopping List" to collect all scaled ingredients.
              </Text>
            </View>
          ) : (
            <>
              {Object.entries(groupedItems).map(([category, items]) => (
                <View key={category} style={styles.categoryGroup}>
                  <Text style={styles.categoryTitle}>{category}</Text>

                  <View style={styles.itemsList}>
                    {items.map((item) => {
                      const formatted = formatShoppingItem(item);

                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.itemRow,
                            item.isChecked && styles.itemRowChecked,
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => handleToggle(item.id)}
                            activeOpacity={0.7}
                            style={styles.checkWrapper}
                          >
                            {item.isChecked ? (
                              <CheckCircle2 size={22} color={palette.mint[300]} />
                            ) : (
                              <Circle size={22} color={palette.gray[500]} />
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleToggle(item.id)}
                            activeOpacity={0.75}
                            style={styles.itemTextContainer}
                          >
                            <Text
                              style={[
                                styles.itemName,
                                item.isChecked && styles.itemNameChecked,
                              ]}
                            >
                              {formatted}
                            </Text>

                            {item.recipeName && (
                              <Text style={styles.recipeTag}>
                                For: {item.recipeName}
                              </Text>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleRemove(item.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.deleteItemBtn}
                          >
                            <Trash2 size={15} color={palette.gray[500]} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}

              {completedItems > 0 && (
                <TouchableOpacity
                  onPress={handleClearCompleted}
                  activeOpacity={0.75}
                  style={styles.clearCompletedBtn}
                >
                  <RotateCcw size={14} color={palette.mint[300]} />
                  <Text style={styles.clearCompletedText}>
                    Remove {completedItems} Checked{' '}
                    {completedItems === 1 ? 'Item' : 'Items'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: palette.forest[900],
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontFamily: typography.families.bold,
    fontSize: 20,
    color: palette.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.mint[300],
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  addInput: {
    flex: 1,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 16,
    color: palette.white,
    fontFamily: typography.families.regular,
    fontSize: 14,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.mint[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(195, 235, 197, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.white,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: typography.families.regular,
    fontSize: 13,
    color: palette.gray[400],
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryGroup: {
    gap: 8,
  },
  categoryTitle: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  itemsList: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemRowChecked: {
    backgroundColor: 'rgba(195, 235, 197, 0.05)',
    borderColor: 'rgba(195, 235, 197, 0.15)',
  },
  checkWrapper: {
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontFamily: typography.families.medium,
    fontSize: 14,
    color: palette.white,
  },
  itemNameChecked: {
    color: palette.gray[500],
    textDecorationLine: 'line-through',
  },
  recipeTag: {
    fontFamily: typography.families.regular,
    fontSize: 11,
    color: palette.peach[300],
    marginTop: 2,
  },
  deleteItemBtn: {
    padding: 6,
  },
  clearCompletedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(195, 235, 197, 0.1)',
    marginTop: 8,
  },
  clearCompletedText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.mint[300],
  },
});
