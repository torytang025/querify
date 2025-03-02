import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, GripVertical, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

// Zod schema
const queryParamSchema = z.object({
  key: z.string().min(1, { message: "Key cannot be empty." }),
  value: z.string().optional()
})

const formSchema = z.object({
  fullQuery: z.string().optional(),
  params: z.array(queryParamSchema)
})

export function QueryForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullQuery: "",
      params: [{ key: "", value: "" }]
    }
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "params"
  })

  // Load initial query from active tab on mount
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      if (activeTab?.url) {
        const url = new URL(activeTab.url)
        const queryParams = Array.from(url.searchParams.entries()).map(
          ([key, value]) => ({ key, value })
        )
        form.reset({
          fullQuery: url.search,
          params:
            queryParams.length > 0 ? queryParams : [{ key: "", value: "" }]
        })
      }
    })
  }, [form])

  // Helper to sync fullQuery from params
  const updateFullQuery = (params: { key?: string; value?: string }[]) => {
    const queryString = params
      .filter((p) => p.key)
      .map((p) => `${p.key}=${p.value || ""}`)
      .join("&")
    form.setValue("fullQuery", queryString ? `?${queryString}` : "", {
      shouldValidate: false
    })
  }

  // Handle drag end to reorder params
  const onDragEnd = (result: any) => {
    const { source, destination } = result
    if (!destination) return // Dropped outside the list
    move(source.index, destination.index) // Reorder the fields array
    const params = form.getValues("params")
    updateFullQuery(params) // Sync fullQuery with new order
  }

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form values:", values)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      if (activeTab?.id) {
        const url = new URL(activeTab.url || "about:blank")
        url.search = values.fullQuery || ""
        chrome.tabs.update(activeTab.id, { url: url.toString() })
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 dark:bg-neutral-900">
        {/* Full Query String Field */}
        <FormField
          control={form.control}
          name="fullQuery"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm dark:text-neutral-200">
                Query String
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="?key=value"
                  className="text-sm border border-neutral-200 rounded-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    const params = new URLSearchParams(
                      e.target.value.replace("?", "")
                    )
                    const newParams = Array.from(params.entries()).map(
                      ([key, value]) => ({
                        key,
                        value
                      })
                    )
                    form.setValue(
                      "params",
                      newParams.length > 0
                        ? newParams
                        : [{ key: "", value: "" }]
                    )
                  }}
                />
              </FormControl>
              <FormMessage className="text-xs dark:text-neutral-400" />
            </FormItem>
          )}
        />

        {/* Dynamic Query Parameters with Drag-and-Drop */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium dark:text-neutral-200">
            Parameters
          </h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="parameters">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2">
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                          <GripVertical className="h-5 w-5 text-gray-400 dark:text-neutral-500 cursor-grab" />
                          <FormField
                            control={form.control}
                            name={`params.${index}.key`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="key"
                                    className="text-sm w-full bg-transparent border border-neutral-200 rounded-md focus:ring-0 focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:border-neutral-600"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      const params = form.getValues("params")
                                      updateFullQuery(params)
                                    }}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs dark:text-neutral-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`params.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="value"
                                    className="text-sm w-full bg-transparent border border-neutral-200 rounded-md focus:ring-0 focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:border-neutral-600"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      const params = form.getValues("params")
                                      updateFullQuery(params)
                                    }}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs dark:text-neutral-400" />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => {
                              remove(index)
                              const params = form.getValues("params")
                              updateFullQuery(params)
                            }}>
                            <Trash2 className="h-4 w-4 dark:text-neutral-400" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full dark:bg-neutral-500 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
            onClick={() => append({ key: "", value: "" })}>
            <Plus className="h-4 w-4 dark:text-neutral-200" />
            Add
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="sm"
          className="w-full dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-200">
          <Check className="h-4 w-4 dark:text-neutral-200" />
          Apply
        </Button>
      </form>
    </Form>
  )
}
