module App


open Fable.Core
open Fable.Import
open Elmish

type Model = {
    Text: string
}

type Message = unit

let init () =
    { Text = "Hello, world" }, Cmd.none

let update (message: Message) (model: Model) =
    model, Cmd.none


// rendering views with React
open Fable.React
open Fable.React.Props
open Fable.Core.JsInterop
open Elmish.React

let view (model: Model) dispatch =
    div [] [
        str model.Text
    ]

open Elmish.HMR
open Elmish.Debug

[<EntryPoint>]
let main _ =
    
    Program.mkProgram init update view
    |> Program.withReactSynchronous "elmish-app"
    |> Program.run
    
    0
