// For more information see https://aka.ms/fsharp-console-apps

(*
why this setup rather than three command line commands?
    elmish template currently broken; does not work to clone; must fix up yourself.
    only if know fable. So doing from scracth. John's special set up.
    
    has to do with fake.
    paket pretty good keeping current; fake not so much.
    
    
*)


open System
open System.Text.RegularExpressions
open System.IO
open Fake.Core
open Fake.DotNet
open Fake.DotNet.NuGet
open Fake.IO
open Fake.IO.FileSystemOperators
open Fake.IO.Globbing.Operators
open Fake.Tools

module Projects =
    let fableJADir = "fableJA"
    let fableJA = Path.Combine (fableJADir, "fableJA.fsproj")
    
    let sln = "fableJA.sln"
    
    let private testProjPath name = Path.Combine ("tests", name, name + ".fsproj")
    
    // TODO: add a unit test project!


let Clean _ =
    Trace.log " --- Cleaning --- "
    Projects.sln |> DotNet.exec id "clean" |> ignore

let Restore _ =
    Trace.log " --- Restoring --- "
    Projects.sln |> DotNet.restore id |> ignore

let Build args =
    Trace.log " --- Build --- "
    Projects.fableJA |> DotNet.build id |> ignore

let Test args =
    Trace.log " --- Running tests --- "

open Fake.Core.TargetOperators

// FS0020: The result of this expression has type 'string' and is explicitly ignored. ...
#nowarn "0020"

let initTargets () =
    Target.create "Clean" Clean
    Target.create "Restore" Restore
    Target.create "Build" Build
    Target.create "Test" Test

    // We have to restore twice, because something about the Fable build messes up the restore for future builds, at
    // least on macOS. Probably it has something to do with our special handling with respect to RIDs.
    "Restore"
        ==> "Build"
        ==> "Test"

[<EntryPoint>]
let main argv =
    argv
    |> Array.toList
    |> Context.FakeExecutionContext.Create false "build.fsx"
    |> Context.RuntimeContext.Fake
    |> Context.setExecutionContext
    initTargets ()
    Target.runOrDefaultWithArguments "Build"
    
    0