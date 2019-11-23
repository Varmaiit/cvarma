// Budget Controller
var  budgetController = (function() {
    // Code
    var Expense = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalInc) {

        if (totalInc > 0 ) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        } 

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;

    };

    var data = {

        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1
    };

    return {
        addItem: function(type,des, val) {
            var newItem, Id;


            // Create new id
            if (data.allItems[type].length > 0) {
                Id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                Id = 0;
            }

            

            // Create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(Id, des, val);
            } else if (type === 'inc') {
                newItem = new Income(Id, des, val);
            }

            // push it into our datastructure
            data.allItems[type].push(newItem);
            // Return the element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index

            //id = 6
            //data.allItems[type][id];

            ids = data.allItems[type].map(function(current) {
                return current.id
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            
            // calculate totoal income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                // calculate the percentage of income that we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1 * 100;
            }
            
        },

        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }

    };


})();

// UI Controller

var  UIController = (function() {

    var DOMStrings = {
        inputDesc: '.add_description',
        inputValue: '.amount_value',
        incAddBtn: '.inc_add_button',
        expSubBtn: '.exp_sub_button',
        incomeContainer: '.incomes_list',
        expensesContainer: '.expenses_list',
        budgetLabel: '.net_budget',
        incomeLabel: '.income_value',
        expensesLabel: '.expenses_value',
        percentageLabel: '.percentage_value',
        combinedContainer: '.inc_exp_container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    return {
        getInput: function() {
            return {
                description: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)

            };
        },

        addListItem: function(obj, type) {
            // Create HTML Strin with placeholder text
            
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html  = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                 element = DOMStrings.expensesContainer;
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            console.log('Object of newItem');
            // Replace the placeholder text with some actual date
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            //newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            newHtml = newHtml.replace('%value%', obj.value);
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var elem = document.getElementById(selectorID);
            elem.parentNode.removeChild(elem);
        },



        clearfields: function() {
            
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index, array) {
                
                current.value = "";
                
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
                        
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            } 

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            var nodeListForEach = function(List, callback) {
                for (var i=0; i < List.length; i++) {
                    callback(List[i], i);
                }

            };
            
            nodeListForEach(fields, function(current, index) {
                // Do Stuff
                if (percentages[index] > 0 ) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        

        getDOMStrings: function() {
            return DOMStrings;
        }
    };

})();

// Global App Controller
var  Controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.incAddBtn).addEventListener('click', function() {
            console.log('Button was clicked')
        });
        
        document.addEventListener('keypress', function(event) {

            var inputObj = UICtrl.getInput();
        
            if ((event.keyCode === 13 || event.which === 13) && !event.shiftKey) {
                console.log("Enter was pressed")
                var input = {
                    type: 'inc',
                    description: inputObj.description,
                    value: inputObj.value
                };
                ctrlAddItem(input);
            }
        
            if (event.keyCode === 13 && event.shiftKey) {
                console.log("Shift Enter was pressed")
                var input = {
                    type: 'exp',
                    description: inputObj.description,
                    value: inputObj.value
                };
                ctrlAddItem(input);
            }
        });

       document.querySelector(DOM.combinedContainer).addEventListener('click', ctrlDeleteItem);

    };

    var updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2.Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        console.log(budget);
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        //1. Calcualte Percenetages
        budgetCtrl.calculatePercentages();

        //2. Read Percentages
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };


    var ctrlAddItem = function(inp) {
        var newItem;
        
        // 1. get tht input field from input data
        console.log(inp);
        
        if (inp.description !== "" && !isNaN(inp.value) && inp.value > 0) {

            // 2. add item to Budget Controller
            var newItem = budgetCtrl.addItem(inp.type,inp.description,inp.value);
            console.log(newItem)

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, inp.type);

            // 4. Clear the fields
            UICtrl.clearfields();

            // 5. Calculate the Budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();

            // 6. Display the budget on the UI

        }  
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();      
            
            //4. Calculate and update percentages
            updatePercentages();


        }
    };
 
    return {
        init: function() {
            console.log('Application has started.');
            setupEventListeners();
        }
    }


})(budgetController, UIController);

Controller.init();
