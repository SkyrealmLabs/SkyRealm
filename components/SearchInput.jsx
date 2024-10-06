import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import Icon from 'react-native-vector-icons/Ionicons'

const SearchInput = (props) => {
  return (
    <View style={[styles.container, props.containerStyles && props.containerStyles]}>
      <Icon name="search" size={20} color={theme.colors.textLight} />
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        {...props}
      />
      {props.value && props.value.length > 0 && (
        <TouchableOpacity onPress={props.onClear} style={styles.clearButton}>
          <Icon name="close-circle" size={20} color={theme.colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default SearchInput

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: hp(5.5),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        paddingHorizontal: 14,
        gap: 10,
        marginTop: 8
    },
    input: {
        flex: 1,
        paddingLeft: wp(2),
    },
    clearButton: {
        marginLeft: wp(2),
    },
})
