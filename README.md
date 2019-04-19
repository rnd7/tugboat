# Tugboat
Data Query Language proof of concept.

## Run
Open index.html in your browser or navigate to [Tugboat](https://rnd7.github.io/tugboat/)

## Keywords and Semantics
Think about a pointer referencing the root element of the data you want to traverse. From this starting point you can choose different Selectors to dive deeper into the data. You basically move the pointer recursively.

Name. Enter the name of the property you want to access
```
name
```

Index. You can use an index to access a specific Element in an array.
```
0
```

Range. You can use ranges with arrays to select one or more elements of an array.
```
0-3
```

Wildcard. Selects all Elements of an array or properties of an object.
```
*
```

Use a regular Expression to match the name of one or more object properties.
```
/[a-z]/
```

Test the value currently selected. Will only keep matches.
```
="value"
=/val.*/
```

Test the value currently selected. Will only keep those that do no match.
```
!="value"
```

Push current pointer values to the result. Useful if you want to traverse further but need the values.
```
$
```

Keep as named group. Same as above but the name is added as group name.
```
$name
```

One level up. Select parent element.
```
..
```

# Query Example
```
array
1-4
/type/
=/type/
="sometype"
..
value
```

## License
See the [LICENSE](https://github.com/rnd7/tugboat/tree/master/LICENSE.md) file for software license rights and limitations (MIT).
