const express=require("express");
const app=express();
const sqlite3=require("sqlite3");
const {open}=require("sqlite");
const path=require("path");
app.use(express.json());

const dbPath=path.join(__dirname,"todoApplication.db");
let db=null;

const initializeDBAndServer=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database;
        });
        app.listen(3000)
    }catch(e){
        console.log(`DbError:${e.message}`)
        process.exit(1)
    }
}
initializeDBAndServer();

const hasPriorityAndStatus=(requestQuery)=>{
    return(
        requestQuery.priority !=undefined && requestQuery.status!=undefined
    );
};

const hasPriority=(requestQuery)=>{
    return(
        requestQuery.priority!=undefined
    )
}
const hasStatus=(requestQuery)=>{
    return(
        requestQuery.status!=undefined
    )
}

app.get("/todos/",async(request,response)=>{
    let getTodosQuery="";
    let data=null;
    const {search_q="",priority,status}=request.query;
    switch(true){
        case hasPriorityAndStatus(request.query):
            getTodosQuery=`
            SELECT *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND status='${status}'
            AND priority='${priority}';`;
            break;
        case hasPriority(request.query):
            getTodosQuery=`
            SELECT *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND priority='${priority}';`;
            break;
        case hasStatus(request.query):
            getTodosQuery=`
            SELECT *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND status='${status}';`;
            break;
        default:
            getTodosQuery=`
            SELECT *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%';`;
    }
    data=await db.all(getTodosQuery);
    response.send(data);
});

app.get("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const todoQuery=`
    SELECT *
    FROM
    todo
    WHERE
    id=${todoId};`;
    const todo=await db.get(todoQuery);
    response.send(todo);
});

app.post("/todos/",async(request,response)=>{
    const {id,todo,priority,status}=request.body;
    const postQuery=`
    INSERT INTO
    todo (id,todo,priority,status)
    VALUES (${id},'${todo}','${priority}','${status}');`;
    await db.run(postQuery);
    response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const requestBody=request.body;
    let updateColumn="";
    switch(true){
        case requestBody.status !=undefined:
            updateColumn="Status";
            break;
        case requestBody.priority!=undefined:
            updateColumn="Priority"
            break;
        case requestBody.todo!=undefined:
            updateColumn="Todo";
            break;
    }
    const previousTodoQuery=`
    SELECT *
    FROM
    todo
    WHERE
    id=${todoId};`;
    const previousTodo=await db.get(previousTodoQuery);
    const {
        todo=previousTodo.todo,
        priority=previousTodo.priority,
        status=previousTodo.status,
    }=request.body;
    const updateTodoQuery=`
    UPDATE
    todo
    SET
    todo='${todo}',
    priority='${priority}',
    status='${status}'
    WHERE
    id=${todoId};`;
    await db.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`)

})

app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const deleteQuery=`
    DELETE FROM
    todo
    WHERE
    id=${todoId};`;
    await db.run(deleteQuery);
    response.send("Todo Deleted");
})

module.exports=app;

