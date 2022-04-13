/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Dimensions,
  TextInput,
  TouchableOpacity
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import Fontisto from 'react-native-vector-icons/Fontisto';
import Modal from 'react-native-modal'


import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
import _ from 'lodash'
import Collapsible from 'react-native-collapsible';




const { width, height, scale } = Dimensions.get("window");
const App = () => {

  const [state, setState] = useState({ data: null, collapsedFlags: null, loading: true })
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const iconsArray = {
   1: { id: 1, iconName: 'food-steak', iconColor: '#f26aa8', iconBackgroundColor: '#fde0ec', extraDescription: '(4 Oz Serving)' },
   2: { id: 2, iconName: 'fish', iconColor: '#6998ee', iconBackgroundColor: '#d8e8ff', extraDescription: '(1 Oz Serving)' },
   3: { id: 3, iconName: 'food', iconColor: '#15a47f', iconBackgroundColor: '#86c9b8', extraDescription: '(2 Oz Serving)' },
   4: { id: 4, iconName: 'food-apple', iconColor: '#f56461', iconBackgroundColor: '#ffd6d8', extraDescription: '(3 Oz Serving)' },
   5: { id: 5, iconName: 'food-apple', iconColor: '#f56461', iconBackgroundColor: '#ffd6d8', extraDescription: '(3 Oz Serving)' },
   6: { id: 6, iconName: 'food-apple', iconColor: '#f56461', iconBackgroundColor: '#ffd6d8', extraDescription: '(3 Oz Serving)' },
  }
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    componentDidMount()
  },[])

  const componentDidMount = async () => {

        try {
          let persistedData = await AsyncStorage.getItem('foodData')
          if(__DEV__) console.log('persistedData',persistedData, typeof(persistedData))

          if(typeof persistedData !== 'undefined' && persistedData !== null){
            if(__DEV__) console.log('ok so we load data from localstorage')
            if(typeof persistedData === 'string'){
              let persistedData = JSON.parse(persistedData)
            }
            var collapsedFlags = {}
            _.map(persistedData, each => {
                collapsedFlags[id] = true
            })
            if(__DEV__) console.log('collapsedFlags',collapsedFlags)
            setState(prev => ({...prev, data: persistedData, collapsedFlags, loading: false }))
          }
          else {
            // get the data from server
            remoteData()
          }
        } catch (error) {
          console.log('error',error)
          console.log('as local fail to load , try to get data from server')
          remoteData()
        }
  }

  const remoteData = async () => {
    let response = await axios.get('https://api.jsonbin.io/b/60e7f4ebf72d2b70bbac2970')
    if(response !== null  && typeof response.data.status !== 'undefined' &&  response.data.status){
      if(__DEV__) console.log('response',response)
      var collapsedFlags = {}
      _.map(response.data.data, each => {
          collapsedFlags[each.id] = true
      })
      setState(prev => ({...prev, data: response.data.data, collapsedFlags, loading: false }))
      console.log('also putting itemS into localstorage',response.data.data)
      try {
        await AsyncStorage.setItem('foodData', JSON.stringify(response.data.data))
      } catch(error) {
        console.log('error to setitem to localstorage',error)
      }
    }
  }

  const toggleCollapsiable = (id) => {
    var collapsedFlags = state.collapsedFlags
    collapsedFlags[id] = !collapsedFlags[id]
    setState(prev => ({...prev, collapsedFlags }) )
  }

  //rendersubcategory
  const subCategory = (data) => {
    const display_item = _.map(data, each => {
    return (
      <Text key={each.id} style={{ color: 'black', paddingLeft: 16, paddingBottom: 10, paddingTop: 5, textTransform: 'capitalize' }}>{each.title}</Text>
    )
    })
    return display_item;
  }


  const renderMainList = () => {
    const display_item = _.map(state.data, eachCollpasible => {
      //console.log('eachCollpasible',eachCollpasible, state.collapsedFlags)
      return (
        <View key={eachCollpasible.id} >
        <View style={{ backgroundColor: 'white',flexDirection:'row',alignItems:'center', elevation: 1, marginTop: 10, width: width - 40, height: 65, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomColor: '#eee', borderBottomWidth: 0.5 }}>
        <View style={{ backgroundColor: iconsArray[eachCollpasible.id].iconBackgroundColor, margin:5, height:65-10, width:65-10, borderRadius:5, alignItems:'center', justifyContent:"center"}}>
          <MaterialCommunityIcons name={iconsArray[eachCollpasible.id].iconName} color={iconsArray[eachCollpasible.id].iconColor} size={35}  />
        </View>
        <View style={{flex:7, paddingLeft:10}}>
        <Text style={{ color: 'black', textTransform: 'capitalize' }}>{eachCollpasible.title}</Text>
        </View>
        <TouchableOpacity onPress={()=> toggleCollapsiable(eachCollpasible.id)} style={{justifyContent:'flex-end', flex:1, flexDirection:'row',  alignItems:'center', paddingRight:10}}>
            <Ionicons name={state.collapsedFlags[eachCollpasible.id] ? "caret-down-outline" : "caret-up-outline"} size={20} color={"grey"}/>
        </TouchableOpacity>
      </View>
      <Collapsible style={{ backgroundColor: 'white', paddingBottom: 20 }} collapsed={state.collapsedFlags[eachCollpasible.id]}>
        {subCategory(eachCollpasible.data)}
      </Collapsible>
      </View>
      )
    })
    return display_item
  }

  //just incase... or most of the time..
  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('foodData')
      console.log('deleting this fooditem list')
    } catch(error) {
      console.log('error to delete to localstorage',error)
    }
  }

  // this will search subcats
  const searchContent = () => {
    var searchContent = String(searchText).trim().toLowerCase()
    var searchResults = []

    // make all category closed first
    var collapsedFlags = state.collapsedFlags
    for (const [key, value] of Object.entries(state.collapsedFlags)) {
      collapsedFlags[key] = true
    }

    console.log('searchContent',searchContent)
    _.map(state.data, eachCat => {

        //search content matching with category name
        if(String(eachCat.title).toLowerCase() === searchContent){
          if(__DEV__) console.log('its found')
          searchResults.push({ catID: eachCat.id, subCat: null })
          collapsedFlags[eachCat.id] = false
        }

        // searching content maatching with subcategory name.. its dirty way however..
        _.map(eachCat.data, eachsubCat => {
            console.log('eachsubCat title',eachsubCat.title)
            if(String(eachsubCat.title).toLowerCase() === searchContent){
              if(__DEV__) console.log('its found')
              searchResults.push({ catID: eachCat.id, subCat: eachsubCat.id })
              collapsedFlags[eachCat.id] = false
            }
        })
      })
      //console.log('searchresults>',searchResults)
      //console.log('collapsedFlags after',collapsedFlags)
      if(searchResults.length > 0){
        setState(prev => ({...prev, collapsedFlags}))
      }
      setSearchResults([...searchResults])
  }

  const searchBar = () => {
    return (
      <View style={{flexDirection:'row',height:65, width: width - 40, marginHorizontal: 20, alignItems:'center',marginTop: 10, marginBottom: 5  }}>
      <View style={{ backgroundColor: '#86c9b8',flexDirection:'row',flex:5,alignItems:'center', elevation: 2,    height: 65, borderRadius:5 }}>
        <View style={{ marginHorizontal:18,}}>
          <Ionicons name="md-search-outline" color={"black"} size={25}  />
        </View>
        <View style={{ }}>
        <TextInput
        value={searchText}
        onChangeText={text => setSearchText(text)}
        placeholder="Try searching sauces names..."/>
        </View>
      </View>
      <TouchableOpacity onPress={()=>searchContent()} style={{alignItems:'center', justifyContent:'center',flex:1,borderRadius:5, height:65,backgroundColor:'#15a47f', marginLeft:10 }}>
          <Ionicons name="md-search-outline" color={"black"} size={25}  />
        </TouchableOpacity>
      </View>
      )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />


      {searchBar()}

      {searchResults.length > 0 && (
          <Text style={{ color: 'black' }}>{searchResults.length} results found</Text>

      )}

      {state.data !== null && (
        <ScrollView>
            {renderMainList()}
        </ScrollView>
      )}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

 container: { flex: 1, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }

});

export default App;
