import React, { useState, useMemo } from 'react';
import {
  Modal,
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
import {
  X,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Trash2,
  Share2,
  Plus,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react-native';
import { GlassSurface } from './ui/GlassSurface';
import { useRecipes } from '../context/RecipeContext';
import { ShoppingItem } from '../types/smart';
import { formatShoppingItem, categorizeIngredient } from '../utils/shoppingUtils';
import { palette, typography, radii } from '../theme/tokens';
import { haptics } from '../utils/haptics';

export interface ShoppingListModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    shoppingList,
    toggleShoppingItem,
    removeShoppingItem,
    clearCompletedShoppingItems,
    clearAllShoppingItems,
    addToShoppingList,
  } = useRecipes();

  const [customItemText, setCustomItemText] = useState('');

  // Group items by category
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
  const pendingItems = totalItems - completedItems;

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <GlassSurface
          variant="prominent"
          intensity={Platform.OS === 'ios' ? 70 : 55}
          borderRadius={32}
          borderWidth={1.2}
          style={styles.sheetContainer}
          contentContainerStyle={styles.sheetInner}
        >
          {/* Top Sheet Drag Indicator */}
          <View style={styles.dragPill} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.titleIconBadge}>
                <ShoppingCart size={18} color={palette.mint[300]} />
              </View>
              <View>
                <Text style={styles.title}>Shopping List</Text>
                <Text style={styles.subtitle}>
                  {totalItems === 0
                    ? 'No items yet'
                    : `${completedItems}/${totalItems} collected`}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {shoppingList.length > 0 && (
                <>
                  <TouchableOpacity
                    onPress={handleShare}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.actionBtn}
                    accessibilityLabel="Share shopping list"
                  >
                    <Share2 size={16} color={palette.peach[300]} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClearAll}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.actionBtn}
                    accessibilityLabel="Clear all items"
                  >
                    <Trash2 size={16} color={palette.coral[500]} />
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeBtn}
                accessibilityLabel="Close shopping list"
              >
                <X size={18} color={palette.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Add Custom Item Bar */}
          <View style={styles.addInputRow}>
            <TextInput
              value={customItemText}
              onChangeText={setCustomItemText}
              placeholder="Add extra ingredient or grocery..."
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
                  <ShoppingBag size={34} color={palette.mint[300]} />
                </View>
                <Text style={styles.emptyTitle}>Your basket is empty</Text>
                <Text style={styles.emptySub}>
                  Open any recipe and tap "Add to Shopping List" to automatically collect scaled ingredients here.
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
                            {/* Checkbox */}
                            <TouchableOpacity
                              onPress={() => handleToggle(item.id)}
                              activeOpacity={0.7}
                              style={styles.checkWrapper}
                            >
                              {item.isChecked ? (
                                <CheckCircle2
                                  size={22}
                                  color={palette.mint[300]}
                                />
                              ) : (
                                <Circle size={22} color={palette.gray[500]} />
                              )}
                            </TouchableOpacity>

                            {/* Label & Details */}
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

                            {/* Remove single item button */}
                            <TouchableOpacity
                              onPress={() => handleRemove(item.id)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={styles.deleteItemBtn}
                            >
                              <X size={15} color={palette.gray[500]} />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}

                {/* Clear Completed Action */}
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
        </GlassSurface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 14, 12, 0.7)',
  },
  sheetContainer: {
    height: '85%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'rgba(14, 26, 23, 0.96)',
    borderTopWidth: 1.2,
    borderLeftWidth: 1.2,
    borderRightWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  sheetInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(195, 235, 197, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.white,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.mint[300],
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  addInput: {
    flex: 1,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    color: palette.white,
    fontFamily: typography.families.regular,
    fontSize: 14,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.mint[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 40,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(195, 235, 197, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: typography.families.bold,
    fontSize: 17,
    color: palette.white,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: typography.families.regular,
    fontSize: 13,
    color: palette.gray[400],
    textAlign: 'center',
    lineHeight: 19,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemRowChecked: {
    backgroundColor: 'rgba(195, 235, 197, 0.05)',
    borderColor: 'rgba(195, 235, 197, 0.15)',
  },
  checkWrapper: {
    marginRight: 10,
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
    marginTop: 10,
  },
  clearCompletedText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.mint[300],
  },
});

export default ShoppingListModal;
