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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons';
//import Fontisto from 'react-native-vector-icons/Fontisto';
import Modal from 'react-native-modal'


import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
import _ from 'lodash'
import Collapsible from 'react-native-collapsible';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'





const { width, height, scale } = Dimensions.get("window");
const App = () => {

  const [state, setState] = useState({ data: null, collapsedFlags: null, loading: true })
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [modalStatus, setModalStatus] = useState(true)
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
          console.log('persistedData',persistedData, typeof(persistedData))

          if(typeof persistedData !== 'undefined' && persistedData !== null){
            console.log('ok so we load data from localstorage')
            if(typeof persistedData === 'string'){
              persistedData = JSON.parse(persistedData)
            }
            console.log('persistedData xx',persistedData)
            var collapsedFlags = {}
            _.map(persistedData, each => {
                collapsedFlags[each.id] = true
            })
            console.log('persistedData',persistedData)
            console.log('collapsedFlags',collapsedFlags)
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
    console.log('triggered')
    let response = await axios.get('https://api.jsonbin.io/b/60e7f4ebf72d2b70bbac2970')
    console.log('response',response)
    if(response !== null  && typeof response.data.status !== 'undefined' &&  response.data.status){
      console.log('response',response.data.data)
      var collapsedFlags = {}
      _.map(response.data.data, each => {
          collapsedFlags[each.id] = true
      })
      console.log('collapsedFlags 3',collapsedFlags)
      setState(prev => ({...prev, data: response.data.data, collapsedFlags, loading: false }))
      console.log('also putting item into localstorage',response.data.data)
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
      <Collapsible style={{ backgroundColor: 'white', paddingBottom: 20, width: width - 40 }} collapsed={state.collapsedFlags[eachCollpasible.id]}>
        {subCategory(eachCollpasible.data)}
      </Collapsible>
      </View>
      )

    })
    return display_item
  }

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />




      <View style={{ marginVertical: 20 }}>
        <Button  onPress={()=>setModalStatus(true)} title="openModal" />
      </View>

      <Button onPress={()=>clearStorage()} title="Clear Storage" />


      <Modal transparent onBackdropPress={()=>setModalStatus(!modalStatus)}  onRequestClose={()=>setModalStatus(!modalStatus)}  onBackButtonPress={()=>setModalStatus(!modalStatus)} isVisible={modalStatus} style={{ padding: 0, margin: 0 }}>
        <View style={{ flex: 1 , justifyContent: 'center', alignItems: 'center'  }}>
        <KeyboardAwareScrollView>
        <View style={{ backgroundColor: '#eee', width, height, padding: 10 }}>



            <TouchableOpacity onPress={()=>setModalStatus(!modalStatus)} >
                <MaterialCommunityIcons color={'black'} name='close' size={34} />
            </TouchableOpacity>

            {searchBar()}

            {searchResults.length > 0 && (
                <Text style={{ color: 'black', paddingLeft: 20 }}>{searchResults.length} results found</Text>

            )}

            {state.data !== null && (
              <View style={{ alignItems: 'center'}}>
              <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
                  {renderMainList()}
              </ScrollView>
              </View>
            )}

        </View>
        </KeyboardAwareScrollView>
      </View>
      </Modal>

      <View style={{ position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'blue', right: 10, top: 10, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons color={'white'} name='message-processing-outline' size={20} />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({



});

export default App;
