import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native'
import { useState } from 'react'
import { icons } from '../constants'

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props}) => { 
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-black-100 font-pmedium">{title}</Text>

      <View className={`border-2 w-full h-16 px-4 bg-white rounded-2xl focus:border-black items-center flex-row ${isFocused ? 'border-black' : 'border-white'}`}>
        <TextInput 
           className="flex-1 text-black font-psemibold"
           value={value}
           placeholder={placeholder}
           placeholderTextColor="#7b7b8b"
           onChangeText={handleChangeText}
           secureTextEntry={title === 'Password' && !showPassword}
           onFocus={() => setIsFocused(true)} // Set focus state
                    onBlur={() => setIsFocused(false)} // Remove focus state
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image source={!showPassword ? icons.eye : icons.eyehide} className="w-6 h-6" resizeMode='contain'/>
          </TouchableOpacity>
        )}
      </View>
    </View>
    
  )
}

export default FormField
